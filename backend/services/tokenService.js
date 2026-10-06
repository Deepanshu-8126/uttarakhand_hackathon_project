import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate short-lived Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
};

/**
 * Generate long-lived Refresh Token
 */
export const generateRefreshToken = (user, sessionId) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      sessionId,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
};

/**
 * Hash refresh token to prevent storing plaintext tokens in DB
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create a new user session with refresh token in MongoDB
 */
export const createSession = async ({ user, req }) => {
  const userAgent = req.headers['user-agent'] || 'Unknown device';
  const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown IP';

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Pre-generate session ID to embed in refresh token payload
  const session = new Session({
    userId: user._id || user.id,
    refreshTokenHash: 'pending',
    userAgent,
    ipAddress,
    expiresAt,
  });

  const refreshToken = generateRefreshToken(user, session._id.toString());
  session.refreshTokenHash = hashToken(refreshToken);
  await session.save();

  const accessToken = generateAccessToken(user);

  return {
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

/**
 * Rotate refresh token: validate, invalidate current session, issue new tokens
 */
export const rotateRefreshToken = async (oldRefreshToken, req) => {
  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  const { sessionId, userId } = decoded;

  const session = await Session.findById(sessionId);
  if (!session || session.isRevoked) {
    // SECURITY: Reuse detection — if an already revoked token is presented, revoke all sessions for this user!
    if (session && session.isRevoked) {
      await Session.updateMany({ userId }, { $set: { isRevoked: true } });
      console.warn(`[Security Alert] Potential refresh token reuse attack detected for user ${userId}. Revoked all sessions.`);
    }
    const error = new Error('Session has been revoked or expired. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  // Verify hash match
  const oldHash = hashToken(oldRefreshToken);
  if (session.refreshTokenHash !== oldHash) {
    session.isRevoked = true;
    await session.save();
    const error = new Error('Invalid refresh token signature. Session revoked.');
    error.statusCode = 401;
    throw error;
  }

  // Revoke old session and create fresh session (Refresh Token Rotation)
  session.isRevoked = true;
  await session.save();

  return await createSession({ user: { _id: userId, id: userId, role: decoded.role }, req });
};

/**
 * Revoke specific session by token
 */
export const revokeSession = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const tokenHash = hashToken(refreshToken);
    await Session.findOneAndUpdate({ refreshTokenHash: tokenHash }, { $set: { isRevoked: true } });
  } catch (err) {
    console.warn('[TokenService] Error revoking session:', err.message);
  }
};

/**
 * Revoke all active sessions for a user (e.g., after password change or reset)
 */
export const revokeAllUserSessions = async (userId) => {
  await Session.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true } });
};

/**
 * Attach HTTP-only cookies to Express response
 */
export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieBaseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' required when frontend is on different domain (e.g. Vercel vs Render)
  };

  if (accessToken) {
    res.cookie('accessToken', accessToken, {
      ...cookieBaseOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });
  }

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieBaseOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth', // Restrict refresh token cookie path to auth endpoints
    });
  }
};

/**
 * Clear authentication cookies on logout
 */
export const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieBaseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  res.clearCookie('accessToken', cookieBaseOptions);
  res.clearCookie('refreshToken', { ...cookieBaseOptions, path: '/api/auth' });
};
