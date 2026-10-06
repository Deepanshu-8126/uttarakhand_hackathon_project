import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { imageSchema, pointSchema } from './sharedSchemas.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    sparse: true,
    index: true,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'citizen', 'tourist', 'trekker', 'local', 'partner', 'owner', 'guide', 'admin'],
    default: 'user',
    lowercase: true,
    trim: true,
  },
  profileImage: {
    type: imageSchema,
    default: null
  },
  location: {
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true, default: 'Uttarakhand' },
    country: { type: String, trim: true, default: 'India' },
    coordinates: {
      type: pointSchema,
      default: undefined
    }
  },
  interests: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

userSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'location.district': 1 });


userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
