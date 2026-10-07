import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/discovery_uttarakhand';

async function run() {
  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000
  });
  console.log('Connected to Atlas successfully!');

  const Destination = conn.model('Destination', new mongoose.Schema({}, { strict: false }), 'destinations');
  const Stay = conn.model('Stay', new mongoose.Schema({}, { strict: false }), 'stays');
  const HiddenLocation = conn.model('HiddenLocationpn', new mongoose.Schema({}, { strict: false }), 'hidden_locations');
  const Spiritual = conn.model('Spiritual', new mongoose.Schema({}, { strict: false }), 'spirituals');
  const Activity = conn.model('Activity', new mongoose.Schema({}, { strict: false }), 'activities');

  const adi = await Destination.findOne({ $or: [{ slug: 'adi-kailash' }, { name: /adi kailash/i }] }).lean();
  console.log('Adi Kailash:', {
    _id: adi?._id,
    name: adi?.name,
    slug: adi?.slug,
    district: adi?.district,
    location: adi?.location,
    coordinates: adi?.coordinates
  });

  const dests = await Destination.find({ 
    $or: [{ district: /pithoragarh/i }, { name: /adi kailash|om parvat|gunji|munsiyari|dharchula|chaukori/i }] 
  }).lean();
  console.log('\n--- Real Pithoragarh / Adi Kailash Destinations ---');
  dests.forEach(d => {
    console.log(`- ${d.name} (${d.slug}) [${d.district}] loc:`, d.location?.coordinates || d.coordinates);
  });

  const stays = await Stay.find({ 
    $or: [{ district: /pithoragarh/i }, { city: /pithoragarh|gunji|munsiyari|dharchula|chaukori/i }] 
  }).lean();
  console.log('\n--- Real Pithoragarh Stays ---');
  stays.forEach(s => {
    console.log(`- ${s.name} [${s.city || s.district}] - ₹${s.pricePerNight || s.price?.amount}`);
  });

  const hidden = await HiddenLocation.find({ district: /pithoragarh/i }).lean();
  console.log('\n--- Real Hidden Locations (Pithoragarh) ---');
  hidden.forEach(h => {
    console.log(`- ${h.name} (${h.tag}) [${h.district}] coords: [${h.lat}, ${h.lng}]`);
  });

  const spir = await Spiritual.find({ district: /pithoragarh/i }).lean();
  console.log('\n--- Real Spiritual Shrines (Pithoragarh) ---');
  spir.forEach(sp => {
    console.log(`- ${sp.name} [${sp.district}]`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
