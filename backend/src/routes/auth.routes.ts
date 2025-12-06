import { Router } from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  googleLogin, 
  forgotPassword, 
  resetPassword, 
  changePassword,
  requestRegisterOTP,
  verifyRegisterOTP,
  requestChangePasswordOTP
} from '../controllers/auth.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Request OTP for registration
router.post(
  '/register/request-otp',
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

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

// Google Login
router.post(
  '/google',
  [
    body('credential').notEmpty().withMessage('Google credential is required'),
    validate
  ],
  googleLogin
);

// Forgot password
router.post(
  '/forgot-password',
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

export default router;
