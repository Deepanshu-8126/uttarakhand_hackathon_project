import crypto from 'crypto';

/**
 * Discovery Uttarakhand - Escrow & OTP Handshake Service
 * Implements Feature 14: Escrow Protection for Vehicle Rentals and Stays.
 * 
 * Flow:
 * 1. Traveler books -> Payment held in Escrow (HELD_IN_ESCROW).
 * 2. System generates secure 6-digit Check-In OTP.
 * 3. Traveler meets Partner physically -> Shares OTP.
 * 4. Partner verifies OTP in Partner Dashboard -> Funds released (RELEASED_TO_PARTNER).
 */

export const ESCROW_STATUS = {
  HELD_IN_ESCROW: 'HELD_IN_ESCROW',
  RELEASED_TO_PARTNER: 'RELEASED_TO_PARTNER',
  REFUNDED_TO_TRAVELER: 'REFUNDED_TO_TRAVELER',
  DISPUTED: 'DISPUTED'
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export const generateCheckInOtp = () => {
  return String(crypto.randomInt(100000, 999999));
};

/**
 * Calculate OTP expiration (typically valid for 72 hours from check-in date or creation)
 */
export const getOtpExpiration = (startDate) => {
  const baseDate = startDate ? new Date(startDate) : new Date();
  const expiresAt = new Date(baseDate.getTime() + 72 * 60 * 60 * 1000);
  return expiresAt;
};

/**
 * Hash an OTP for secure storage
 */
export const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

/**
 * Verify a plain OTP against a stored hash or plaintext OTP
 */
export const verifyOtpToken = (enteredOtp, storedOtp, storedOtpHash) => {
  if (!enteredOtp) return false;
  const sanitizedEntered = String(enteredOtp).trim();

  // If plain OTP is stored
  if (storedOtp && sanitizedEntered === String(storedOtp).trim()) {
    return true;
  }

  // If hashed OTP is stored
  if (storedOtpHash) {
    const computedHash = hashOtp(sanitizedEntered);
    return computedHash === storedOtpHash;
  }

  return false;
};

/**
 * Process escrow release to partner
 */
export const releaseEscrowPayout = (booking, partnerId) => {
  const amount = booking.amount || booking.pricingSnapshot?.total || booking.totalAmount || 0;
  const platformFee = Math.round(amount * 0.05); // 5% platform fee
  const partnerPayout = amount - platformFee;

  return {
    success: true,
    releasedAt: new Date(),
    transactionId: `ESCROW-REL-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    grossAmount: amount,
    platformFee,
    partnerPayout,
    currency: booking.currency || 'INR',
    message: `Escrow payout of INR ${partnerPayout} successfully released to partner.`
  };
};

export default {
  ESCROW_STATUS,
  generateCheckInOtp,
  getOtpExpiration,
  hashOtp,
  verifyOtpToken,
  releaseEscrowPayout
};
