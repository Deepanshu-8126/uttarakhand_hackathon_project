import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    default: '',
    index: true,
  },
  userName: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: 'user',
  },
  refreshTokenHash: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '',
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// TTL index to automatically prune expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
