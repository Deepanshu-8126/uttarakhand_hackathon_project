import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

/**
 * Protect routes - Verifies JWT from HTTP-only cookie or Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Try reading from Authorization Bearer header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Try reading from HTTP-only cookie
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login to continue.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please log in again.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check if password changed after token was issued
    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: 'Password was recently changed. Please log in again.',
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired. Please refresh your session.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please log in again.',
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Example usage: authorizeRoles('admin', 'guide')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}].`,
      });
    }

    next();
  };
};

export const adminOnly = authorizeRoles('admin');
export const partnerOnly = authorizeRoles('partner');
export const requireAuth = protect;

/**
 * Optional Authentication - parses token if provided, but does not block if missing
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      const user = await User.findById(userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (_) {
      // Continue unauthenticated
    }
  }
  next();
};
