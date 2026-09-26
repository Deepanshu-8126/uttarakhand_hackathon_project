import mongoose from 'mongoose';

const SosAlertSchema = new mongoose.Schema({
  alertCode: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  travelerName: {
    type: String,
    default: 'Uttarakhand Traveler'
  },
  travelerPhone: {
    type: String,
    default: ''
  },
  incidentType: {
    type: String,
    enum: [
      'GENERAL_SOS',
      'MEDICAL',
      'AMS_ALTITUDE',
      'LANDSLIDE_STRANDED',
      'LOST_TRAIL',
      'WOMEN_SAFETY',
      'VEHICLE_BREAKDOWN',
      'WILDLIFE_ENCOUNTER'
    ],
    default: 'GENERAL_SOS'
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'CRITICAL'
  },
  message: {
    type: String,
    default: 'Emergency SOS beacon triggered. Immediate assistance requested.'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    altitude: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    nearestLandmark: { type: String, default: 'Uttarakhand Mountain Trail' },
    district: { type: String, default: 'Rudraprayag' }
  },
  deviceTelemetry: {
    batteryLevel: { type: Number, default: 100 },
    isCharging: { type: Boolean, default: false },
    networkStatus: { type: String, default: 'ONLINE' },
    userAgent: { type: String, default: '' }
  },
  emergencyContacts: [
    {
      name: { type: String },
      phone: { type: String },
      relation: { type: String, default: 'Emergency Contact' },
      notified: { type: Boolean, default: false }
    }
  ],
  status: {
    type: String,
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true
  },
  rescueDetails: {
    assignedTeam: { type: String, default: 'SDRF Uttarakhand Rapid Response' },
    assignedOfficer: { type: String, default: '' },
    officerPhone: { type: String, default: '' },
    etaMinutes: { type: Number, default: 25 },
    resolutionNotes: { type: String, default: '' }
  },
  timeline: [
    {
      status: { type: String },
      note: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  offlineQueuedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for geospatial lookups & active query filtering
SosAlertSchema.index({ 'location.lat': 1, 'location.lng': 1 });
SosAlertSchema.index({ createdAt: -1 });

export default mongoose.models.SosAlert || mongoose.model('SosAlert', SosAlertSchema);
