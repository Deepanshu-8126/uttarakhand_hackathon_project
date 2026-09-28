import mongoose from 'mongoose';

const exploreLaterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  destinationId: { type: String, required: true },
  destinationName: { type: String, required: true },
  activityType: { type: String, default: 'Trek' },
  status: { type: String, enum: ['PLANNING_LATER', 'READY_TO_PLAN', 'PLANNED', 'COMPLETED'], default: 'PLANNING_LATER' },
  date: { type: String, default: null },
  travelers: { type: String, default: null },
  budget: { type: String, default: null },
  savedGuideIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guide' }],
  savedPlaceIds: [{ type: String }],
  savedStays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stay' }],
  notes: { type: String, default: '' },
  rawIntentText: { type: String, default: '' }
}, { timestamps: true });

exploreLaterSchema.index({ user: 1, destinationName: 1, activityType: 1 }, { unique: true });

const ExploreLater = mongoose.model('ExploreLater', exploreLaterSchema);
export default ExploreLater;
