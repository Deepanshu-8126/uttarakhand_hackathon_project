import mongoose from 'mongoose';

const communityReportSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  circuit: {
    type: String,
    default: 'Uttarakhand Mountain Corridor'
  },
  condition: {
    type: String,
    enum: ['HEAVY_RAIN', 'LANDSLIDE', 'ROAD_BLOCKED', 'SNOWFALL', 'CLEAR_SAFE', 'AVALANCHE_ALERT', 'FOG_LOW_VISIBILITY'],
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'WARNING'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  coordinates: {
    lat: { type: Number },
    lon: { type: Number }
  },
  reporterName: {
    type: String,
    default: 'Local Valley Sentinel'
  },
  reporterRole: {
    type: String,
    enum: ['PARTNER', 'TRAVELER', 'LOCAL_GUIDE'],
    default: 'PARTNER'
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: Number,
    default: 1
  },
  consensusVerified: {
    type: Boolean,
    default: false
  },
  consensusCount: {
    type: Number,
    default: 1
  },
  isOfflineSynced: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically expire after 24 hours
  }
}, {
  timestamps: true
});

communityReportSchema.index({ location: 1, createdAt: -1 });

const CommunityReport = mongoose.model('CommunityReport', communityReportSchema);
export default CommunityReport;
