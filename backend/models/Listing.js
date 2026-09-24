import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Unified Listing Schema (Audit E-01 Fix):
 * Consolidates static seed entities and dynamic partner marketplace items into a single
 * polymorphic collection. Eliminates dual-source-of-truth split and branching logic.
 */
const ListingSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Listing title/name is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['stay', 'rental', 'guide', 'experience', 'activity'],
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: ['curated_seed', 'verified_partner'],
      default: 'curated_seed',
      index: true
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Partner',
      default: null,
      index: true
    },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, required: true, index: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
        default: [79.0669, 30.7346]
      },
      altitudeMeters: { type: Number, default: 1500 }
    },
    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['night', 'day', 'trip', 'person'], default: 'night' },
      currency: { type: String, default: 'INR' },
      cleaningFee: { type: Number, default: 0 },
      greenCess: { type: Number, default: 50 }, // Mandatory environmental preservation fee
      depositAmount: { type: Number, default: 0 }
    },
    verification: {
      isVerified: { type: Boolean, default: false, index: true },
      trustTier: { 
        type: String, 
        enum: ['unverified', 'tier_1_exif', 'tier_2_video_kyc', 'tier_3_geo_selfie'], 
        default: 'unverified' 
      },
      verifiedAt: { type: Date, default: null },
      escrowEligible: { type: Boolean, default: true }
    },
    specifications: {
      // Polymorphic attributes based on category
      propertyType: { type: String, default: null }, // for stays (e.g. Homestay, TRH, Heritage)
      roomType: { type: String, default: null },
      maxGuests: { type: Number, default: 2 },
      vehicleModel: { type: String, default: null }, // for rentals (e.g. Himalayan 450, Activa)
      fuelType: { type: String, default: null },
      guideLanguages: [{ type: String }],           // for guides
      trekDifficulty: { type: String, default: null }
    },
    media: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
        exifGpsVerified: { type: Boolean, default: false }
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'active',
      index: true
    },
    rating: {
      average: { type: Number, default: 4.8, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for high-speed corridor queries
ListingSchema.index({ category: 1, 'location.district': 1, status: 1 });
ListingSchema.index({ 'pricing.basePrice': 1, 'verification.isVerified': 1 });

const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

export default Listing;
