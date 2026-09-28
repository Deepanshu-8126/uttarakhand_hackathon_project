import mongoose from 'mongoose';
import { imageSchema, pointSchema } from './sharedSchemas.js';

const hiddenLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  tag: { type: String, required: true },
  district: { type: String, required: true },
  region: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  altitude: { type: String, required: true },
  description: { type: String, required: true },
  bestTime: { type: String, required: true },
  entryFee: { type: String, required: true },
  homestay: { type: String, default: null },
  nearby: { type: String, required: true },
  
  coverImage: {
    url: { type: String, required: true },
    source: { type: String, default: 'Unsplash Verified / Wikimedia Commons' },
    license: { type: String, default: 'Free Editorial / CC BY-SA' },
    attribution: { type: String, default: 'Pahadi Tourism Contributor' },
    alt: { type: String, default: 'Scenic view of Uttarakhand hidden gem' },
  },

  images: {
    search: { type: String },
    pexels: { type: String },
    unsplash: { type: String },
  },

  location: {
    type: pointSchema,
    default: function () {
      return { type: 'Point', coordinates: [this.lng, this.lat] };
    },
  },

  liveWeather: {
    temperature: { type: Number },
    precipitation: { type: Number },
    weatherCode: { type: Number },
    condition: { type: String },
    updatedAt: { type: Date },
  },
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

hiddenLocationSchema.index({ location: '2dsphere' }, { sparse: true });
hiddenLocationSchema.index({ district: 1, region: 1 });

const HiddenLocation = mongoose.model('HiddenLocation', hiddenLocationSchema, 'hidden_locations');
export default HiddenLocation;
