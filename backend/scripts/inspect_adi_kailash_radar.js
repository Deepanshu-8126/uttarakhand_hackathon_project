import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'backend/.env' });

import Destination from '../models/Destination.js';
import Stay from '../models/Stay.js';
import Rental from '../models/Rental.js';
import PartnerListing from '../models/PartnerListing.js';
import Activity from '../models/Activity.js';
import Spiritual from '../models/Spiritual.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB Connected');

  const adi = await Destination.findOne({ 
    $or: [{ slug: 'adi-kailash' }, { name: /adi kailash/i }] 
  }).lean();

  console.log('--- ADI KAILASH DESTINATION ---');
  console.log('ID:', adi?._id);
  console.log('Name:', adi?.name);
  console.log('Slug:', adi?.slug);
  console.log('District:', adi?.district);
  console.log('Coordinates:', adi?.coordinates);
  console.log('Location:', adi?.location);
  console.log('Lat/Lng:', adi?.latitude, adi?.longitude);

  const lat = adi?.latitude || adi?.coordinates?.lat || (adi?.location?.coordinates ? adi.location.coordinates[1] : 30.3211);
  const lng = adi?.longitude || adi?.coordinates?.lng || (adi?.location?.coordinates ? adi.location.coordinates[0] : 80.5706);

  console.log('\nResolved Center Coordinates:', { lat, lng });

  // Search if Gauri kund or Dhaba or Coffee Time exist in any collection
  const allDestWithGauri = await Destination.find({ name: /gauri|dhaba|coffee/i }).lean();
  console.log('\n--- Dest matching gauri/dhaba/coffee ---', allDestWithGauri.map(d => ({ name: d.name, district: d.district })));

  const allStays = await Stay.find({ name: /gauri|dhaba|coffee/i }).lean();
  console.log('--- Stays matching gauri/dhaba/coffee ---', allStays.map(s => ({ name: s.name, district: s.district })));

  const allPartners = await PartnerListing.find({ title: /gauri|dhaba|coffee/i }).lean();
  console.log('--- PartnerListings matching gauri/dhaba/coffee ---', allPartners.map(p => ({ title: p.title, district: p.district })));

  const allSpiritual = await Spiritual.find({ name: /gauri|dhaba|coffee/i }).lean();
  console.log('--- Spiritual matching gauri/dhaba/coffee ---', allSpiritual.map(s => ({ name: s.name, district: s.district })));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
