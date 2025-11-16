import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database';
import config from '../config/environment';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response.utils';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM public.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      errorResponse(res, 'User already exists with this email', 400);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO public.users (email, password_hash, display_name, role) 
       VALUES ($1, $2, $3, 'member') 
       RETURNING id, email, display_name, role, reputation_points, created_at`,
      [email, passwordHash, displayName]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    successResponse(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          reputationPoints: user.reputation_points,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Server error during registration');
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, display_name, avatar_url, 
              role, reputation_points, is_banned 
       FROM public.users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    const user = result.rows[0];

    // Check if user is banned
    if (user.is_banned) {
      errorResponse(res, 'Your account has been banned', 403);
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      unauthorizedResponse(res, 'Invalid email or password');
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        reputationPoints: user.reputation_points,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Server error during login');
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM public.users WHERE email = $1',
      [email]
    );

    // Always return success (security best practice)
    if (userResult.rows.length === 0) {
      successResponse(res, null, 'Jika email terdaftar, link reset password akan dikirim');
      return;
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token in database
    await pool.query(
      `UPDATE public.users 
       SET password_reset_token = $1, password_reset_expires = $2 
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // TODO: Send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);

    successResponse(
      res,
      config.nodeEnv === 'development' ? { devToken: resetToken } : null,
      'Jika email terdaftar, link reset password akan dikirim'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (newPassword.length < 6) {
      errorResponse(res, 'Password minimal 6 karakter', 400);
      return;
    }

    // Hash the token to compare with database
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const userResult = await pool.query(
      `SELECT id FROM public.users 
       WHERE password_reset_token = $1 
       AND password_reset_expires > NOW()`,
      [resetTokenHash]
    );

    if (userResult.rows.length === 0) {
      errorResponse(res, 'Token tidak valid atau sudah kadaluarsa', 400);
      return;
    }

    const user = userResult.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE public.users 
       SET password_hash = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    successResponse(res, null, 'Password berhasil direset');
  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Change user password (authenticated)
 * POST /api/auth/change-password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      unauthorizedResponse(res);
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, 'Password minimal 6 karakter', 400);
      return;
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, password_hash FROM public.users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      errorResponse(res, 'User tidak ditemukan', 404);
      return;
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      unauthorizedResponse(res, 'Password lama tidak sesuai');
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE public.users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    successResponse(res, null, 'Password berhasil diubah');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Server error');
  }
};
