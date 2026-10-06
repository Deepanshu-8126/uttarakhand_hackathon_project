import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import { resolveLocation } from '../services/locationService.js';
import { createAndSendOtp, verifyOtp as verifyOtpService } from '../services/otpService.js';
import {
  createSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllUserSessions,
  setAuthCookies,
  clearAuthCookies,
} from '../services/tokenService.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const RESET_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'reset-secret';

// Password Strength Helper
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one numeric digit.';
  }
  return null;
};

// Safe user serializer
const serializeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || user.phone || '',
  phone: user.phone || user.mobile || '',
  role: user.role,
  isEmailVerified: Boolean(user.isEmailVerified),
  isMobileVerified: Boolean(user.isMobileVerified),
  isActive: Boolean(user.isActive),
  avatar: user.avatarUrl || user.profileImage?.url || null,
  avatarUrl: user.avatarUrl || user.profileImage?.url || null,
  profileImage: user.profileImage || null,
  location: user.location || null,
  interests: user.interests || [],
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @desc  Register a new user account (Signup)
 * @route POST /api/auth/signup or /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, phone, password, confirmPassword, location, city, district, interests } = req.body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanMobile = (mobile || phone || '').trim();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match.',
      });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    // Check duplicate email
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check duplicate mobile if provided
    if (cleanMobile) {
      const mobileExists = await User.findOne({
        $or: [{ mobile: cleanMobile }, { phone: cleanMobile }],
      });
      if (mobileExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this mobile number already exists.',
        });
      }
    }

    let userLocation = undefined;
    const locInput = location !== undefined ? location : (city ? { city, district } : null);
    if (locInput) {
      const resolved = await resolveLocation(locInput);
      if (resolved) {
        userLocation = {
          city: resolved.city || '',
          district: resolved.district || '',
          state: resolved.state || 'Uttarakhand',
          country: resolved.country || 'India',
        };
        if (
          Array.isArray(resolved.coordinates) &&
          resolved.coordinates.length === 2 &&
          typeof resolved.coordinates[0] === 'number' &&
          typeof resolved.coordinates[1] === 'number' &&
          !isNaN(resolved.coordinates[0]) &&
          !isNaN(resolved.coordinates[1])
        ) {
          userLocation.coordinates = {
            type: 'Point',
            coordinates: [resolved.coordinates[0], resolved.coordinates[1]],
          };
        }
      }
    }

    // Create user (unverified by default)
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile || undefined,
      phone: cleanMobile || undefined,
      password,
      role: 'user',
      isEmailVerified: false,
      isMobileVerified: false,
      isActive: true,
      location: userLocation,
      interests: Array.isArray(interests) ? interests : [],
    });

    // Generate & Dispatch Email Verification OTP
    let otpResult = null;
    try {
      otpResult = await createAndSendOtp({
        userId: user._id,
        destination: user.email,
        channel: 'email',
        purpose: 'signup',
        name: user.name,
      });
    } catch (otpErr) {
      console.warn('[Signup] OTP dispatch notice:', otpErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      data: {
        userId: user._id,
        email: user.email,
        requiresVerification: true,
        devOtp: otpResult?.devOtp,
      },
    });
  } catch (error) {
    console.error('[RegisterUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during signup. Please try again.',
    });
  }
};

/**
 * @desc  Register a new PARTNER account
 * @route POST /api/auth/register-partner
 * @access Public
 */
export const registerPartner = async (req, res) => {
  try {
    const { name, email, mobile, phone, password, confirmPassword, businessName, partnerType } = req.body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanMobile = (mobile || phone || '').trim();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match.',
      });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Role is strictly forced to 'partner'
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile || undefined,
      phone: cleanMobile || undefined,
      password,
      role: 'partner',
      isEmailVerified: false,
      isMobileVerified: false,
      isActive: true,
    });

    let otpResult = null;
    try {
      otpResult = await createAndSendOtp({
        userId: user._id,
        destination: user.email,
        channel: 'email',
        purpose: 'signup',
        name: user.name,
      });
    } catch (otpErr) {
      console.warn('[RegisterPartner] OTP dispatch notice:', otpErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Partner account created! Please verify your email with the 6-digit code sent.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        requiresVerification: true,
        devOtp: otpResult?.devOtp,
      },
    });
  } catch (error) {
    console.error('[RegisterPartner Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during partner registration.',
    });
  }
};

/**
 * @desc  Verify OTP (for signup, login, email-verification)
 * @route POST /api/auth/verify-otp
 * @access Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { destination, email, mobile, otp, purpose = 'signup' } = req.body;
    const target = (destination || email || mobile || '').trim().toLowerCase();

    if (!target || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destination (email or mobile) and 6-digit OTP code.',
      });
    }

    // Verify OTP record
    await verifyOtpService({ destination: target, otp, purpose });

    // Handle according to purpose
    if (purpose === 'signup' || purpose === 'email-verification') {
      const user = await User.findOne({
        $or: [{ email: target }, { mobile: target }, { phone: target }],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account associated with this verification not found.',
        });
      }

      if (target.includes('@')) {
        user.isEmailVerified = true;
      } else {
        user.isMobileVerified = true;
      }
      user.lastLogin = new Date();
      await user.save();

      // Dispatch welcome email asynchronously
      sendWelcomeEmail(user.email, user.name).catch(() => {});

      // Establish authenticated session with tokens and HTTP-only cookies
      const { accessToken, refreshToken } = await createSession({ user, req });
      setAuthCookies(res, { accessToken, refreshToken });

      return res.json({
        success: true,
        message: 'Account verified successfully! Welcome to Discovery Uttarakhand.',
        data: {
          ...serializeUser(user),
          token: accessToken,
          refreshToken,
        },
      });
    }

    if (purpose === 'login') {
      const user = await User.findOne({
        $or: [{ email: target }, { mobile: target }, { phone: target }],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      user.lastLogin = new Date();
      await user.save();

      const { accessToken, refreshToken } = await createSession({ user, req });
      setAuthCookies(res, { accessToken, refreshToken });

      return res.json({
        success: true,
        message: 'Login verification successful!',
        data: {
          ...serializeUser(user),
          token: accessToken,
          refreshToken,
        },
      });
    }

    if (purpose === 'forgot-password') {
      // Create temporary reset token valid for 15 minutes
      const resetToken = jwt.sign(
        { destination: target, purpose: 'reset-password' },
        RESET_SECRET,
        { expiresIn: '15m' }
      );

      return res.json({
        success: true,
        message: 'OTP verified successfully. You may now reset your password.',
        data: { resetToken },
      });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'OTP verification failed.',
    });
  }
};

/**
 * @desc  Resend OTP
 * @route POST /api/auth/resend-otp or /api/auth/send-otp
 * @access Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { destination, email, mobile, purpose = 'signup', channel = 'email' } = req.body;
    const target = (destination || email || mobile || '').trim().toLowerCase();

    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destination email or mobile number.',
      });
    }

    const user = await User.findOne({
      $or: [{ email: target }, { mobile: target }, { phone: target }],
    });

    const name = user ? user.name : 'Explorer';

    const result = await createAndSendOtp({
      userId: user?._id || null,
      destination: target,
      channel: target.includes('@') ? 'email' : 'sms',
      purpose,
      name,
    });

    return res.json({
      success: true,
      message: `A new 6-digit verification code has been dispatched to your ${result.channel}.`,
      data: {
        expiresInSeconds: result.expiresInSeconds,
        devOtp: result.devOtp,
      },
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to dispatch verification code.',
    });
  }
};

/**
 * @desc  Authenticate User (Login with Email/Mobile + Password)
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, mobile, identifier, password } = req.body;

    const rawTarget = (identifier || email || mobile || '').trim();
    const cleanPassword = (password || '').trim();

    if (!rawTarget || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/mobile and password.',
      });
    }

    const isEmail = rawTarget.includes('@');
    const cleanTarget = rawTarget.toLowerCase();

    // Query user by email or mobile/phone
    const user = await User.findOne(
      isEmail
        ? { email: cleanTarget }
        : { $or: [{ mobile: rawTarget }, { phone: rawTarget }] }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/phone and password.',
      });
    }

    // Check account verification status
    if (!user.isEmailVerified && !user.googleId) {
      // Auto-dispatch verification OTP so user can immediately verify
      try {
        await createAndSendOtp({
          userId: user._id,
          destination: user.email,
          channel: 'email',
          purpose: 'signup',
          name: user.name,
        });
      } catch (otpErr) {
        console.warn('[Login Notice] OTP dispatch error:', otpErr.message);
      }

      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_NOT_VERIFIED',
        message: 'Account not verified. A 6-digit OTP has been sent to your email. Please verify to continue.',
        data: {
          userId: user._id,
          email: user.email,
          requiresVerification: true,
        },
      });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Create session and set HTTP-only cookies
    const { accessToken, refreshToken } = await createSession({ user, req });
    setAuthCookies(res, { accessToken, refreshToken });

    return res.json({
      success: true,
      message: 'Login successful!',
      data: {
        ...serializeUser(user),
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('[LoginUser Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.',
    });
  }
};

/**
 * @desc  Rotate Refresh Token and issue new Access Token
 * @route POST /api/auth/refresh
 * @access Public (token in cookie or body)
 */
export const refreshSession = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found. Please log in again.',
      });
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(incomingToken, req);
    setAuthCookies(res, { accessToken, refreshToken });

    return res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    clearAuthCookies(res);
    const status = error.statusCode || 401;
    return res.status(status).json({
      success: false,
      message: error.message || 'Session expired. Please log in again.',
    });
  }
};

/**
 * @desc  Logout User & Revoke Session
 * @route POST /api/auth/logout
 * @access Public / Private
 */
export const logoutUser = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (incomingToken) {
      await revokeSession(incomingToken);
    }

    clearAuthCookies(res);
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    clearAuthCookies(res);
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  }
};

/**
 * @desc  Initiate Forgot Password Flow (Dispatches OTP with Anti-Enumeration Protection)
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const target = (email || identifier || '').trim().toLowerCase();

    if (!target) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const user = await User.findOne({
      $or: [{ email: target }, { mobile: target }, { phone: target }],
    });

    if (user && user.isActive) {
      try {
        await createAndSendOtp({
          userId: user._id,
          destination: user.email,
          channel: 'email',
          purpose: 'forgot-password',
          name: user.name,
        });
      } catch (err) {
        console.warn('[ForgotPassword] OTP send warning:', err.message);
      }
    }

    // Generic response to prevent account enumeration
    return res.json({
      success: true,
      message: 'If an account exists with this email, a verification code has been sent.',
      data: {
        destination: target,
      },
    });
  } catch (error) {
    console.error('[ForgotPassword Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.',
    });
  }
};

/**
 * @desc  Verify Reset OTP
 * @route POST /api/auth/verify-reset-otp
 * @access Public
 */
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, destination, otp } = req.body;
    const target = (email || destination || '').trim().toLowerCase();

    if (!target || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code.',
      });
    }

    await verifyOtpService({
      destination: target,
      otp,
      purpose: 'forgot-password',
    });

    const resetToken = jwt.sign(
      { destination: target, purpose: 'reset-password' },
      RESET_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      success: true,
      message: 'OTP verified successfully. You may now enter your new password.',
      data: { resetToken },
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Invalid or expired OTP.',
    });
  }
};

/**
 * @desc  Reset Password
 * @route POST /api/auth/reset-password
 * @access Public (Requires valid resetToken or OTP)
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, email, otp, newPassword, confirmPassword } = req.body;

    const passwordToSet = newPassword || req.body.password;
    const confirmToSet = confirmPassword || req.body.confirmPassword;

    if (!passwordToSet) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password.',
      });
    }

    if (confirmToSet && passwordToSet !== confirmToSet) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const passwordError = validatePasswordStrength(passwordToSet);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    let targetEmail;

    // 1. Verify via resetToken
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, RESET_SECRET);
        if (decoded.purpose !== 'reset-password') {
          return res.status(400).json({ success: false, message: 'Invalid reset token purpose.' });
        }
        targetEmail = decoded.destination;
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Reset token has expired. Please restart the forgot password process.' });
      }
    }
    // 2. Fallback: verify via direct OTP + email in same request
    else if (email && otp) {
      const target = email.trim().toLowerCase();
      await verifyOtpService({ destination: target, otp, purpose: 'forgot-password' });
      targetEmail = target;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Authorization required. Please provide a valid reset token or OTP.',
      });
    }

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.password = passwordToSet;
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate all active sessions for security
    await revokeAllUserSessions(user._id);

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[ResetPassword Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password.',
    });
  }
};

/**
 * @desc  Change Password for Authenticated User
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and new password.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.',
      });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password. Please try again.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password.',
      });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Revoke other active sessions for security
    await revokeAllUserSessions(user._id);

    // Issue fresh session for current client
    const { accessToken, refreshToken } = await createSession({ user, req });
    setAuthCookies(res, { accessToken, refreshToken });

    return res.json({
      success: true,
      message: 'Password updated successfully! All other sessions have been logged out.',
      data: {
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('[ChangePassword Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again later.',
    });
  }
};

/**
 * @desc  Send Email Verification OTP for currently logged in user
 * @route POST /api/auth/send-email-verification
 * @access Private
 */
export const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email address is already verified.',
      });
    }

    const result = await createAndSendOtp({
      userId: user._id,
      destination: user.email,
      channel: 'email',
      purpose: 'email-verification',
      name: user.name,
    });

    return res.json({
      success: true,
      message: 'A 6-digit verification code has been dispatched to your email.',
      data: {
        expiresInSeconds: result.expiresInSeconds,
      },
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to dispatch verification email.',
    });
  }
};

/**
 * @desc  Verify Email with OTP for logged in user
 * @route POST /api/auth/verify-email
 * @access Private
 */
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the 6-digit OTP code.',
      });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await verifyOtpService({
      destination: user.email,
      otp,
      purpose: 'email-verification',
    });

    user.isEmailVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: 'Email address verified successfully!',
      data: {
        isEmailVerified: true,
      },
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to verify email.',
    });
  }
};

/**
 * @desc  Get Authenticated User Profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      data: serializeUser(user),
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving user.' });
  }
};

/**
 * @desc   Authenticate user via Google OAuth 2.0 / One-Tap JWT credential
 * @route  POST /api/auth/google
 * @access Public
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, role = 'user' } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required.' });
    }

    let payload = null;

    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (googleRes.ok) {
        payload = await googleRes.json();
      }
    } catch (fetchErr) {
      console.warn('[GoogleAuth] Direct tokeninfo warning:', fetchErr.message);
    }

    if (!payload) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
          payload = JSON.parse(jsonPayload);
        }
      } catch (parseErr) {
        console.error('[GoogleAuth] Failed to parse JWT token payload:', parseErr);
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google credential or token expired.' });
    }

    const { email, name, sub: googleId, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role === 'partner' ? 'partner' : 'user';

    let user = await User.findOne({
      $or: [
        { googleId },
        { email: cleanEmail },
      ],
    });

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (picture && !user.avatarUrl && (!user.profileImage || !user.profileImage.url)) {
        user.avatarUrl = picture;
        needsSave = true;
      }
      user.lastLogin = new Date();
      if (needsSave) {
        await user.save();
      }
    } else {
      const randomPassword = crypto.randomBytes(32).toString('hex') + '!Google2026';
      user = await User.create({
        name: name || 'Himalayan Explorer',
        email: cleanEmail,
        googleId,
        avatarUrl: picture || null,
        password: randomPassword,
        role: assignedRole,
        isEmailVerified: true,
        isActive: true,
        lastLogin: new Date(),
      });
    }

    const { accessToken, refreshToken } = await createSession({ user, req });
    setAuthCookies(res, { accessToken, refreshToken });

    return res.json({
      success: true,
      data: {
        ...serializeUser(user),
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    return res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
};
