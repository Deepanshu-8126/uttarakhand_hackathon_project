import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

/**
 * Strict limiter for login attempts (5 attempts per 15 minutes)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please try again after 15 minutes.',
  },
});

/**
 * Strict limiter for OTP verification attempts (10 requests per 15 minutes)
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please wait a few minutes before trying again.',
  },
});

/**
 * Limiter for OTP resend (1 request per 60 seconds)
 */
export const otpResendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 1000 : 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Please wait at least 60 seconds before requesting another verification code.',
  },
});

/**
 * Limiter for signup and forgot-password requests (5 per 15 minutes)
 */
export const authActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
