import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const destinationSchema = new mongoose.Schema({}, { strict: false });
const Destination = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);

async function seedHemkund() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const existing = await Destination.findOne({ 
    $or: [
      { slug: 'hemkund-sahib' },
      { name: { $regex: 'hemkund', $options: 'i' } }
    ]
  });

  if (existing) {
    console.log('Hemkund Sahib already exists in Destination collection:', existing.name);
  } else {
    const hemkundDoc = {
      name: "Hemkund Sahib",
      slug: "hemkund-sahib",
      district: "Chamoli",
      region: "Garhwal",
      category: "Spiritual",
      description: "Gurdwara Hemkund Sahib is a revered high-altitude Sikh place of worship and sacred glacial lake situated in the Chamoli district of Uttarakhand at an elevation of 4,572 metres (15,000 feet). Surrounded by seven snow-clad mountain peaks adorned with Nishan Sahibs, it is one of the highest and most awe-inspiring pilgrimage sites in the world, also serving as the gateway to the Valley of Flowers.",
      shortDescription: "Sacred high-altitude glacial lake & Sikh shrine surrounded by seven snow peaks at 15,200 ft in Chamoli.",
      coverImage: {
        url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Hemkund_Sahib_Chamoli_Uttarakhand_India.jpg/1920px-Hemkund_Sahib_Chamoli_Uttarakhand_India.jpg",
        alt: "Gurdwara Hemkund Sahib & Glacial Lake"
      },
      images: [
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Hemkund_Sahib_Chamoli_Uttarakhand_India.jpg/1920px-Hemkund_Sahib_Chamoli_Uttarakhand_India.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Hemkund_Sahib_and_Lokpal_Lake.jpg/1920px-Hemkund_Sahib_and_Lokpal_Lake.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/Drone_shot_of_Hemkund_sahib.jpg/1920px-Drone_shot_of_Hemkund_sahib.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Sri_Hemkund_Sahib_3.jpg/1920px-Sri_Hemkund_Sahib_3.jpg"
      ],
      location: {
        type: "Point",
        coordinates: [79.618467, 30.6987543]
      },
      altitude: "4,572m (15,000 ft)",
      bestTimeToVisit: "June to October",
      weather: "Cold alpine (0°C to 12°C in summer)",
      highlights: [
        "Glacial Hemkund Lake",
        "Ancient Lakshman Temple",
        "Seven Snow-Clad Summits",
        "Brahma Kamal Sacred Flowers",
        "Valley of Flowers Gateway"
      ],
      experiences: [
        "High-altitude holy dip in glacial waters",
        "Trek through Ghangaria & Bhyundar Valley",
        "Sacred Langar service at 15,000 feet",
        "Witnessing rare Himalayan Brahma Kamal blooms"
      ],
      rating: 4.9,
      ratingsQuantity: 142,
      isFeatured: true,
      popularRanking: 3,
      idealDays: "3-4 Days from Rishikesh/Govindghat",
      nearestAirport: "Jolly Grant Airport, Dehradun (290 km)",
      nearestRailway: "Rishikesh Railway Station (270 km)"
    };

    const created = await Destination.create(hemkundDoc);
    console.log('✅ Successfully created Hemkund Sahib destination:', created._id, created.name);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seedHemkund().catch(err => {
  console.error('Error seeding Hemkund:', err);
  process.exit(1);
});
