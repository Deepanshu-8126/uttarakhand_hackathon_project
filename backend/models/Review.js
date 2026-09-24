import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    maxLength: 2000
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Destination', 'Spiritual', 'Culture', 'Activity', 'Stay', 'Rental', 'Guide', 'PartnerListing', 'site', 'Site', 'General', 'general', 'DestinationReview', 'StayReview'],
    default: 'Destination'
  },
  target: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'hidden'],
    default: 'approved'
  },
  reply: {
    text: { type: String, trim: true, maxlength: 1000, default: null },
    repliedAt: { type: Date, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  
  // Backward compatibility fields
  targetId: { type: mongoose.Schema.Types.ObjectId }, // keep so old frontend logic might not crash instantly if it reads it? Better not to, it will be overridden anyway.
  isApproved: { type: Boolean, default: false }
}, {
  timestamps: true,
});

reviewSchema.index({ targetType: 1, target: 1, status: 1 });
reviewSchema.index({ user: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
