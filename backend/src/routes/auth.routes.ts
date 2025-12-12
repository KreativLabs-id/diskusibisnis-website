import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  setPassword,
  requestRegisterOTP,
  verifyRegisterOTP,
  requestChangePasswordOTP
} from '../controllers/auth.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  loginRateLimiter,
  passwordResetRateLimiter,
  otpRateLimiter
} from '../middlewares/rate-limit.middleware';

const router = Router();

// Request OTP for registration (with rate limiting)
router.post(
  '/register/request-otp',
  otpRateLimiter,
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('displayName').notEmpty().withMessage('Nama wajib diisi'),
    validate
  ],
  requestRegisterOTP
);

// Verify OTP and complete registration
router.post(
  '/register/verify-otp',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP harus 6 digit'),
    validate
  ],
  verifyRegisterOTP
);

// Register (legacy - without OTP)
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    validate
  ],
  register
);

// Login (with brute force protection)
router.post(
  '/login',
  loginRateLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

// Logout
router.post('/logout', logout);

// Google Login
router.post(
  '/google',
  [
    body('credential').notEmpty().withMessage('Google credential is required'),
    validate
  ],
  googleLogin
);

// Forgot password (with rate limiting)
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    validate
  ],
  forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
  ],
  resetPassword
);

// Request OTP for password change
router.post(
  '/change-password/request-otp',
  requireAuth,
  requestChangePasswordOTP
);

// Change password (authenticated)
router.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate
  ],
  changePassword
);

// Set password for Google users (who don't have a password yet)
router.post(
  '/set-password',
  requireAuth,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('confirmPassword').notEmpty().withMessage('Konfirmasi password wajib diisi'),
    validate
  ],
  setPassword
);

export default router;

