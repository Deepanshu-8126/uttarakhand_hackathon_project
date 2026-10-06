import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { imageSchema, pointSchema } from './sharedSchemas.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  mobile: {
    type: String,
    sparse: true,
    trim: true,
  },
  phone: {
    type: String,
    sparse: true,
    trim: true,
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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['user', 'citizen', 'tourist', 'trekker', 'local', 'partner', 'owner', 'guide', 'admin'],
    default: 'user',
    lowercase: true,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  passwordChangedAt: {
    type: Date,
    default: null,
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
  }]
}, {
  timestamps: true,
});

userSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'location.district': 1 });

// Ensure location.coordinates is strictly valid GeoJSON Point or undefined to satisfy MongoDB 2dsphere index
userSchema.pre('validate', function () {
  if (this.location && typeof this.location === 'object') {
    const loc = this.location;
    if (loc.coordinates) {
      if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
        const [lng, lat] = loc.coordinates;
        if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
          loc.coordinates = {
            type: 'Point',
            coordinates: [lng, lat]
          };
        } else {
          loc.coordinates = undefined;
        }
      } else if (typeof loc.coordinates === 'object') {
        const coords = loc.coordinates.coordinates;
        if (
          Array.isArray(coords) &&
          coords.length === 2 &&
          typeof coords[0] === 'number' &&
          typeof coords[1] === 'number' &&
          !isNaN(coords[0]) &&
          !isNaN(coords[1])
        ) {
          loc.coordinates.type = 'Point';
        } else {
          loc.coordinates = undefined;
        }
      } else {
        loc.coordinates = undefined;
      }
    } else {
      loc.coordinates = undefined;
    }
  }
});

// Ensure mobile and phone fields stay synchronized
userSchema.pre('save', function () {
  if (this.mobile && !this.phone) {
    this.phone = this.mobile;
  } else if (this.phone && !this.mobile) {
    this.mobile = this.phone;
  }
});

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  // Guard against re-hashing already hashed password (starts with $2a$ or $2b$)
  if (/^\$2[ab]\$\d{2}\$/.test(this.password)) {
    return;
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
