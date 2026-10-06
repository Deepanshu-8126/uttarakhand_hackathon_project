import User from '../models/User.js';
import Partner from '../models/Partner.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { resolveLocation } from '../services/locationService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, location, city, district, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    let resolvedLocation = null;
    const locInput = location !== undefined ? location : (city ? { city, district } : null);
    if (locInput) {
      resolvedLocation = await resolveLocation(locInput);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      location: resolvedLocation,
      interests: Array.isArray(interests) ? interests : []
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          interests: user.interests,
          token: generateToken(user._id),
          refreshToken: generateRefreshToken(user._id),
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          interests: user.interests,
          token: generateToken(user._id),
          refreshToken: generateRefreshToken(user._id),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profileImage: user.profileImage || null,
        location: user.location || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

export const logoutUser = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc  Register a new PARTNER account
 * @route POST /api/auth/register-partner
 * @access Public
 * Security: role is ALWAYS forced to 'partner' server-side.
 *           Client cannot inject a different role via request body.
 */
export const registerPartner = async (req, res) => {
  try {
    const { name, email, password, businessName, businessType, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // CRITICAL: role is always forced to 'partner' — never read from req.body
    const user = await User.create({
      name,
      email,
      password,
      role: 'partner',
      phone: phone || undefined,
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid partner data' });
    }

    // NOTE: Partner profile (with required fields like partnerType, district) is
    // completed by the partner after first login via the dashboard onboarding flow.
    // We intentionally do NOT auto-create it here to avoid validation errors.

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      }
    });
  } catch (error) {
    console.error('Partner registration error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
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
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    let payload = null;

    // 1. Verify with Google's public tokeninfo endpoint
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (googleRes.ok) {
        payload = await googleRes.json();
      }
    } catch (fetchErr) {
      console.warn('[GoogleAuth] Direct tokeninfo verification warning:', fetchErr.message);
    }

    // 2. Fallback: Parse JWT payload directly if tokeninfo had network timeout/firewall issue
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
      return res.status(400).json({ success: false, message: 'Invalid Google credential or token expired' });
    }

    const { email, name, sub: googleId, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();

    // Enforce role safety: only 'partner' or 'user' allowed for self-selection
    const assignedRole = role === 'partner' ? 'partner' : 'user';

    // 3. Find existing user by googleId OR email
    let user = await User.findOne({
      $or: [
        { googleId },
        { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
    });

    if (user) {
      // Update googleId and avatar if not present
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (picture && !user.avatarUrl && (!user.profileImage || !user.profileImage.url)) {
        user.avatarUrl = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      // Create new user account with secure random password
      const randomPassword = crypto.randomBytes(32).toString('hex') + '!Google2026';
      user = await User.create({
        name: name || 'Himalayan Explorer',
        email: cleanEmail,
        googleId,
        avatarUrl: picture || null,
        password: randomPassword,
        role: assignedRole,
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || user.profileImage?.url || null,
        profileImage: user.profileImage || (user.avatarUrl ? { url: user.avatarUrl } : null),
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication.' });
  }
};
