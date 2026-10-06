import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  channel: {
    type: String,
    enum: ['email', 'sms'],
    default: 'email',
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'forgot-password', 'change-email', 'change-mobile', 'email-verification'],
    required: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  resendCount: {
    type: Number,
    default: 0,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
});

// TTL index to automatically prune expired OTP records from MongoDB
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ destination: 1, purpose: 1, isUsed: 1 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
