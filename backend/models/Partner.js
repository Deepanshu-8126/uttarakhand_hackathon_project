/**
 * Discovery Uttarakhand — Partner Mongoose Model
 * Represents registered tourism partners (homestay hosts, guides, trek operators, rental owners).
 * Identity documents and administrative notes remain strictly off-chain in MongoDB.
 */

import mongoose from 'mongoose';
import { imageSchema, pointSchema } from './sharedSchemas.js';

const partnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  legalBusinessName: {
    type: String,
    trim: true,
    maxlength: 160
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 120,
    default: null
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  partnerType: {
    type: String,
    required: true,
    enum: [
      'Homestay', 'Hotel', 'Guide', 'TrekOperator', 'VehicleRental', 'ActivityProvider',
      'TransportOperator', 'MobilityPartner', 'DriverPartner', 'TourOperator',
      'ExperienceProvider', 'SharedRideOperator'
    ]
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true,
    default: null
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    default: null
  },
  locality: {
    type: String,
    trim: true,
    default: null
  },
  state: {
    type: String,
    trim: true,
    default: 'Uttarakhand'
  },
  pincode: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: pointSchema,
    default: null
  },
  profileImage: {
    type: imageSchema,
    default: null
  },
  logo: {
    type: imageSchema,
    default: null
  },
  coverImage: {
    type: imageSchema,
    default: null
  },
  operatingHours: {
    type: String,
    trim: true,
    default: '09:00 AM - 08:00 PM'
  },
  pickupInformation: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  operatingAreas: [{
    type: String,
    trim: true
  }],
  serviceCategories: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  socialLinks: {
    website: { type: String, trim: true, default: null },
    whatsapp: { type: String, trim: true, default: null },
    instagram: { type: String, trim: true, default: null },
    facebook: { type: String, trim: true, default: null }
  },
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'SUSPENDED', 'REVOKED'],
    default: 'APPROVED'
  },
  verificationStatus: {
    type: String,
    enum: ['NOT_STARTED', 'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'REVOKED'],
    default: 'DRAFT'
  },
  verificationNotes: {
    type: String,
    default: null
  },
  credentialType: {
    type: String,
    trim: true,
    default: null // e.g. "Uttarakhand Tourism Homestay Registration"
  },
  credentialReference: {
    type: String,
    trim: true,
    default: null // e.g. "UK-HS-2024-889"
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

partnerSchema.index({ district: 1 });
partnerSchema.index({ city: 1 });
partnerSchema.index({ locality: 1 });
partnerSchema.index({ partnerType: 1 });
partnerSchema.index({ verificationStatus: 1 });
partnerSchema.index({ location: '2dsphere' }, { sparse: true });

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
