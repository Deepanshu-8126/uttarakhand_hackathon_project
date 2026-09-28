import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import Destination from '../models/Destination.js';
import HiddenLocation from '../models/HiddenLocation.js';

async function sync() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const hiddenLocs = await HiddenLocation.find({ isActive: true });
  console.log(`Found ${hiddenLocs.length} hidden locations to sync to Destinations.`);

  let updatedCount = 0;
  let createdCount = 0;

  for (const loc of hiddenLocs) {
    const existing = await Destination.findOne({
      $or: [{ slug: loc.slug }, { name: new RegExp(`^${loc.name}$`, 'i') }]
    });

    const docData = {
      name: loc.name,
      slug: loc.slug,
      tag: loc.tag,
      district: loc.district,
      region: loc.region,
      latitude: loc.lat,
      longitude: loc.lng,
      location: { type: 'Point', coordinates: [loc.lng, loc.lat] },
      locationSource: 'GPS Verified (OpenStreetMap / Google Maps 2026)',
      altitude: loc.altitude,
      description: loc.description,
      shortDescription: loc.tag + ' — ' + loc.description.slice(0, 120),
      bestTime: loc.bestTime,
      bestTimeToVisit: loc.bestTime,
      category: 'Hidden Gem',
      isFeatured: true,
      isActive: true,
      coverImage: {
        url: loc.coverImage.url,
        publicId: null,
        source: loc.coverImage.source,
        sourcePage: loc.images?.unsplash || loc.images?.pexels || loc.coverImage.url,
        license: loc.coverImage.license,
        attribution: loc.coverImage.attribution,
        alt: loc.coverImage.alt
      },
      gallery: [
        {
          url: loc.coverImage.url,
          publicId: null,
          source: loc.coverImage.source,
          license: loc.coverImage.license,
          attribution: loc.coverImage.attribution,
          alt: loc.coverImage.alt
        }
      ],
      highlights: [
        loc.tag,
        loc.altitude,
        loc.nearby,
        loc.entryFee ? `Entry: ${loc.entryFee}` : 'Free Entry',
        loc.homestay ? `Homestays: ${loc.homestay}` : 'Authentic Homestays'
      ].filter(Boolean)
    };

    if (existing) {
      await Destination.updateOne({ _id: existing._id }, { $set: docData });
      console.log(`✓ Updated Destination: ${loc.name}`);
      updatedCount++;
    } else {
      await Destination.create(docData);
      console.log(`+ Created Destination: ${loc.name}`);
      createdCount++;
    }
  }

  console.log(`\nSync complete! Updated: ${updatedCount}, Created: ${createdCount}`);
  await mongoose.disconnect();
}

sync().catch(err => {
  console.error('Sync error:', err);
  process.exit(1);
});
