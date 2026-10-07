import express from 'express';
import {
  registerUser,
  registerPartner,
  loginUser,
  verifyOtp,
  resendOtp,
  refreshSession,
  logoutUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
  sendEmailVerification,
  verifyEmail,
  getMe,
  googleAuth,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  authActionLimiter,
} from '../middleware/authRateLimiters.js';

const router = express.Router();

// Registration / Signup
router.post('/signup', authActionLimiter, registerUser);
router.post('/register', authActionLimiter, registerUser); // Backwards compatibility alias
router.post('/register-partner', authActionLimiter, registerPartner);

// OTP Verification & Resend
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/send-otp', otpResendLimiter, resendOtp);
router.post('/resend-otp', otpResendLimiter, resendOtp);

// Authentication / Login / Logout
router.post('/login', loginLimiter, loginUser);
router.post('/refresh', refreshSession);
router.post('/logout', logoutUser);
router.post('/google', authActionLimiter, googleAuth);

// Password Management
router.post('/forgot-password', authActionLimiter, forgotPassword);
router.post('/verify-reset-otp', otpVerifyLimiter, verifyResetOtp);
router.post('/reset-password', authActionLimiter, resetPassword);
router.post('/change-password', protect, changePassword);

// Email Verification
router.post('/send-email-verification', protect, sendEmailVerification);
router.post('/verify-email', protect, otpVerifyLimiter, verifyEmail);

// User Profile
router.get('/me', protect, getMe);

export default router;
