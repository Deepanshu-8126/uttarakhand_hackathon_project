import crypto from 'crypto';
import OTP from '../models/OTP.js';
import { sendVerificationOTP, sendLoginOTP, sendPasswordResetOTP } from './emailService.js';
import { sendSmsOTP, isSmsConfigured } from './smsService.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_INTERVAL_MS = 60 * 1000; // 60 seconds
const MAX_VERIFICATION_ATTEMPTS = 5;
const MAX_RESEND_COUNT = 5;

/**
 * Generate cryptographically secure 6-digit OTP
 */
export const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash plain OTP with salt/secret to prevent plaintext storage
 */
export const hashOtp = (otp, destination) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'discovery-uttarakhand-secure-otp-secret';
  return crypto.createHmac('sha256', secret).update(`${destination}:${otp}`).digest('hex');
};

/**
 * Generate, persist, and dispatch OTP to user destination (Email or SMS)
 */
export const createAndSendOtp = async ({
  userId = null,
  destination,
  channel = 'email',
  purpose,
  name = 'Explorer',
  metadata = null,
}) => {
  const cleanDestination = destination.trim().toLowerCase();

  // Check existing active OTP for rate-limit cooldown
  const existingOtp = await OTP.findOne({
    destination: cleanDestination,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingOtp) {
    const timeSinceLastSend = Date.now() - new Date(existingOtp.lastSentAt).getTime();
    if (timeSinceLastSend < RESEND_INTERVAL_MS) {
      const waitSeconds = Math.ceil((RESEND_INTERVAL_MS - timeSinceLastSend) / 1000);
      const error = new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
      error.statusCode = 429;
      throw error;
    }

    if (existingOtp.resendCount >= MAX_RESEND_COUNT) {
      const error = new Error('Maximum OTP resend limit reached for this window. Please try again after 5 minutes.');
      error.statusCode = 429;
      throw error;
    }
  }

  // Generate new OTP
  const rawOtp = generateSecureOtp();
  const otpHash = hashOtp(rawOtp, cleanDestination);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUTH OTP DEV] Generated OTP for ${cleanDestination} (${purpose}): ${rawOtp}`);
  }

  // Invalidate any old unused OTPs for this destination and purpose
  await OTP.updateMany(
    { destination: cleanDestination, purpose, isUsed: false },
    { $set: { isUsed: true } }
  );

  // Save new OTP record
  const otpDoc = await OTP.create({
    userId,
    destination: cleanDestination,
    channel,
    purpose,
    otpHash,
    expiresAt,
    attempts: 0,
    resendCount: existingOtp ? existingOtp.resendCount + 1 : 0,
    lastSentAt: new Date(),
    isUsed: false,
    metadata,
  });

  // Dispatch OTP via appropriate channel
  if (channel === 'sms') {
    await sendSmsOTP({ phone: destination, otp: rawOtp, purpose });
  } else {
    // Channel: email
    if (purpose === 'signup' || purpose === 'email-verification') {
      await sendVerificationOTP(cleanDestination, name, rawOtp);
    } else if (purpose === 'login') {
      await sendLoginOTP(cleanDestination, name, rawOtp);
    } else if (purpose === 'forgot-password') {
      await sendPasswordResetOTP(cleanDestination, name, rawOtp);
    } else {
      await sendVerificationOTP(cleanDestination, name, rawOtp);
    }
  }

  return {
    success: true,
    channel,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    otpId: otpDoc._id,
  };
};

/**
 * Verify submitted OTP against hashed database record
 */
export const verifyOtp = async ({
  destination,
  otp,
  purpose,
}) => {
  const cleanDestination = destination.trim().toLowerCase();

  const otpDoc = await OTP.findOne({
    destination: cleanDestination,
    purpose,
    isUsed: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    const error = new Error('No active OTP found. Please request a new verification code.');
    error.statusCode = 400;
    throw error;
  }

  // Check if expired
  if (new Date() > new Date(otpDoc.expiresAt)) {
    otpDoc.isUsed = true;
    await otpDoc.save();
    const error = new Error('OTP has expired. Please request a new verification code.');
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (otpDoc.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    otpDoc.isUsed = true;
    await otpDoc.save();
    const error = new Error('Too many invalid attempts. This OTP has been invalidated. Please request a new one.');
    error.statusCode = 429;
    throw error;
  }

  // Compare hashes
  const computedHash = hashOtp(otp.trim(), cleanDestination);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(computedHash, 'utf8'),
    Buffer.from(otpDoc.otpHash, 'utf8')
  );

  if (!isMatch) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    const remaining = MAX_VERIFICATION_ATTEMPTS - otpDoc.attempts;
    const error = new Error(
      remaining > 0
        ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Valid! Mark as used to prevent replay attacks
  otpDoc.isUsed = true;
  await otpDoc.save();

  return {
    success: true,
    otpDoc,
    metadata: otpDoc.metadata,
  };
};
