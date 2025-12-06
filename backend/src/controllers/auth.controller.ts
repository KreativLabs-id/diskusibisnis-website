import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/database';
import config from '../config/environment';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response.utils';
import { sendPasswordResetEmail, sendOTPEmail, sendPasswordChangeOTPEmail } from '../utils/email.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In-memory OTP storage (for production, use Redis)
const otpStore = new Map<string, { otp: string; data: any; expiresAt: Date }>();

// Clean expired OTPs periodically
setInterval(() => {
  const now = new Date();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Request OTP for registration
 * POST /api/auth/register/request-otp
 */
export const requestRegisterOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password || !displayName) {
      errorResponse(res, 'Email, password, dan nama wajib diisi', 400);
      return;
    }

    if (password.length < 6) {
      errorResponse(res, 'Password minimal 6 karakter', 400);
      return;
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM public.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      errorResponse(res, 'Email sudah terdaftar', 400);
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP with registration data
    otpStore.set(`register:${email}`, {
      otp,
      data: { email, password, displayName },
      expiresAt
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, displayName);

    if (!emailSent) {
      errorResponse(res, 'Gagal mengirim email OTP. Coba lagi.', 500);
      return;
    }

    successResponse(res, { email }, 'Kode OTP telah dikirim ke email Anda');
  } catch (error) {
    console.error('Request register OTP error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Verify OTP and complete registration
 * POST /api/auth/register/verify-otp
 */
export const verifyRegisterOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      errorResponse(res, 'Email dan OTP wajib diisi', 400);
      return;
    }

    // Get stored OTP
    const stored = otpStore.get(`register:${email}`);

    if (!stored) {
      errorResponse(res, 'OTP tidak ditemukan atau sudah kadaluarsa. Silakan minta OTP baru.', 400);
      return;
    }

    if (stored.expiresAt < new Date()) {
      otpStore.delete(`register:${email}`);
      errorResponse(res, 'OTP sudah kadaluarsa. Silakan minta OTP baru.', 400);
      return;
    }

    if (stored.otp !== otp) {
      errorResponse(res, 'Kode OTP salah', 400);
      return;
    }

    // OTP valid, create user
    const { password, displayName } = stored.data;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with verified email
    const result = await pool.query(
      `INSERT INTO public.users (email, password_hash, display_name, role, is_verified) 
       VALUES ($1, $2, $3, 'member', true) 
       RETURNING id, email, display_name, role, reputation_points, created_at, is_verified`,
      [email, passwordHash, displayName]
    );

    const user = result.rows[0];

    // Clear OTP
    otpStore.delete(`register:${email}`);

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
          isVerified: user.is_verified,
        },
        token,
      },
      'Registrasi berhasil! Email Anda telah terverifikasi.',
      201
    );
  } catch (error) {
    console.error('Verify register OTP error:', error);
    errorResponse(res, 'Server error during registration');
  }
};

/**
 * Register new user (legacy - direct registration without OTP)
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
 * Google Login
 * POST /api/auth/google
 */
export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      errorResponse(res, 'Invalid Google token', 400);
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let userResult = await pool.query(
      'SELECT * FROM public.users WHERE email = $1 OR google_id = $2',
      [email, googleId]
    );

    let user;
    let isNewUser = false;

    if (userResult.rows.length === 0) {
      // Create new user
      const result = await pool.query(
        `INSERT INTO public.users (email, display_name, avatar_url, google_id, role, is_verified) 
         VALUES ($1, $2, $3, $4, 'member', false) 
         RETURNING id, email, display_name, avatar_url, role, reputation_points, is_verified`,
        [email, name || email?.split('@')[0], picture, googleId]
      );
      user = result.rows[0];
      isNewUser = true;
    } else {
      user = userResult.rows[0];
      
      // Update google_id if not set
      if (!user.google_id) {
        await pool.query(
          'UPDATE public.users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3',
          [googleId, picture, user.id]
        );
      }

      // Check if user is banned
      if (user.is_banned) {
        errorResponse(res, 'Your account has been banned', 403);
        return;
      }
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
        avatarUrl: user.avatar_url || picture,
        role: user.role,
        reputationPoints: user.reputation_points || 0,
      },
      token,
      isNewUser,
    }, isNewUser ? 'Account created successfully' : 'Login successful');
  } catch (error) {
    console.error('Google login error:', error);
    errorResponse(res, 'Failed to authenticate with Google');
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
      'SELECT id, email, display_name FROM public.users WHERE email = $1',
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

    // Send email with reset link
    const emailSent = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.display_name || 'User'
    );

    if (!emailSent) {
      console.error(`Failed to send reset email to ${email}`);
    }

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
 * Request OTP for password change
 * POST /api/auth/change-password/request-otp
 */
export const requestChangePasswordOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      unauthorizedResponse(res);
      return;
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, email, display_name FROM public.users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      errorResponse(res, 'User tidak ditemukan', 404);
      return;
    }

    const user = userResult.rows[0];

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(`change-password:${userId}`, {
      otp,
      data: { userId },
      expiresAt
    });

    // Send OTP email
    const emailSent = await sendPasswordChangeOTPEmail(user.email, otp, user.display_name || 'User');

    if (!emailSent) {
      errorResponse(res, 'Gagal mengirim email OTP. Coba lagi.', 500);
      return;
    }

    successResponse(res, { email: user.email }, 'Kode OTP telah dikirim ke email Anda');
  } catch (error) {
    console.error('Request change password OTP error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Change user password with OTP verification
 * POST /api/auth/change-password
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword, otp } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      unauthorizedResponse(res);
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, 'Password minimal 6 karakter', 400);
      return;
    }

    // Verify OTP if provided
    if (otp) {
      const stored = otpStore.get(`change-password:${userId}`);

      if (!stored) {
        errorResponse(res, 'OTP tidak ditemukan atau sudah kadaluarsa', 400);
        return;
      }

      if (stored.expiresAt < new Date()) {
        otpStore.delete(`change-password:${userId}`);
        errorResponse(res, 'OTP sudah kadaluarsa. Silakan minta OTP baru.', 400);
        return;
      }

      if (stored.otp !== otp) {
        errorResponse(res, 'Kode OTP salah', 400);
        return;
      }
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

    // Clear OTP
    otpStore.delete(`change-password:${userId}`);

    successResponse(res, null, 'Password berhasil diubah');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Server error');
  }
};
