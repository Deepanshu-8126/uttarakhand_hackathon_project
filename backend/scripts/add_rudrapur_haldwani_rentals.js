import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Rental from '../models/Rental.js';
import { cacheDelPattern } from '../config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const newRentals = [
  {
    name: "Rudrapur City Wheels & Self-Drive Hub",
    slug: "rudrapur-city-wheels-self-drive",
    description: "Verified bike, scooter and self-drive car rentals located right next to Rudrapur City Station and Gaba Chowk. Quick KYC, doorstep delivery across Pantnagar airport and SIDCUL industrial zone. Escrow & Cash-on-Arrival check-in supported.",
    city: "Rudrapur",
    district: "Udham Singh Nagar",
    address: "Near Railway Station & Gaba Chowk, Rudrapur, Uttarakhand 263153",
    category: "Bike & Scooter Rental",
    location: {
      type: "Point",
      coordinates: [79.4000, 28.9800]
    },
    locationNotes: "5 mins from Rudrapur City Railway Station, 15 mins from Pantnagar Airport (PGH)",
    phone: "+91 98371 45220",
    website: "https://discoveryuttarakhand.in/rentals/rudrapur",
    rating: 4.9,
    reviewCount: 94,
    ratingSource: "Discovery Uttarakhand Partner Network",
    vehicles: [
      {
        name: "Royal Enfield Himalayan 450",
        type: "Motorcycle",
        typeDetail: "Adventure Tourer",
        pricePerDay: 1800,
        priceNotes: "Helmets & panniers included",
        image: {
          url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop",
          source: "Unsplash",
          alt: "Royal Enfield Himalayan Adventure Tourer"
        }
      },
      {
        name: "Royal Enfield Classic 350 Reborn",
        type: "Motorcycle",
        typeDetail: "Cruiser",
        pricePerDay: 1400,
        priceNotes: "2 Helmets provided",
        image: {
          url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1000&auto=format&fit=crop",
          source: "Unsplash",
          alt: "Royal Enfield Classic 350"
        }
      },
      {
        name: "Honda Activa 6G Premium",
        type: "Scooter",
        typeDetail: "Scooter",
        pricePerDay: 500,
        priceNotes: "Unlimited KMs in Tarai/Kumaon zone",
        image: {
          url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Honda_Activa_6G.jpg/1920px-Honda_Activa_6G.jpg",
          source: "Wikimedia Commons",
          alt: "Honda Activa 6G"
        }
      },
      {
        name: "Maruti Swift Dzire (Self-Drive)",
        type: "Sedan",
        typeDetail: "Self-Drive Car",
        pricePerDay: 2200,
        priceNotes: "Fastag & Hill-permit fitted",
        image: {
          url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop",
          source: "Unsplash",
          alt: "Maruti Swift Dzire"
        }
      }
    ],
    priceNotes: "₹1,000 refundable security deposit (or escrow OTP authorization). Valid driving license required."
  },
  {
    name: "Haldwani Himalayan Riders & Self-Drive Fleet",
    slug: "haldwani-himalayan-riders",
    description: "Premier gateway rental hub at Tikonia Chauraha Haldwani (28 km from Rudrapur, gateway to Nainital & Bhimtal). Mountain-ready 4x4 SUVs, Royal Enfields, and automatic scooters with hill-assist climb tuned engines.",
    city: "Haldwani",
    district: "Nainital",
    address: "Nainital Road, Near Tikonia Chauraha & Kathgodam Stn, Haldwani, Uttarakhand 263139",
    category: "Bike & Scooter Rental",
    location: {
      type: "Point",
      coordinates: [79.5130, 29.2183]
    },
    locationNotes: "Kathgodam / Haldwani junction. Doorstep delivery available to Rudrapur & Pantnagar",
    phone: "+91 97588 32110",
    website: "https://discoveryuttarakhand.in/rentals/haldwani",
    rating: 4.9,
    reviewCount: 138,
    ratingSource: "Discovery Uttarakhand Partner Network",
    vehicles: [
      {
        name: "Royal Enfield Himalayan 450 (GPS Ready)",
        type: "Motorcycle",
        typeDetail: "Adventure Tourer",
        pricePerDay: 1800,
        priceNotes: "Equipped with live GPS SOS tracking",
        image: {
          url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop",
          source: "Unsplash",
          alt: "Royal Enfield Himalayan 450"
        }
      },
      {
        name: "Mahindra Thar 4x4 Hard Top",
        type: "SUV",
        typeDetail: "4x4 Mountain SUV",
        pricePerDay: 3800,
        priceNotes: "All-terrain tyres, hill-hold assist",
        image: {
          url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop",
          source: "Unsplash",
          alt: "Mahindra Thar 4x4"
        }
      },
      {
        name: "TVS NTorq 125 Race Edition",
        type: "Scooter",
        typeDetail: "Sporty Scooter",
        pricePerDay: 600,
        priceNotes: "Bluetooth navigation on console",
        image: {
          url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/TVS_Ntorq_125_backside.jpg/1920px-TVS_Ntorq_125_backside.jpg",
          source: "Wikimedia Commons",
          alt: "TVS NTorq 125"
        }
      }
    ],
    priceNotes: "Doorstep delivery to Rudrapur/Pantnagar station on 30 min notice."
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    for (const r of newRentals) {
      const existing = await Rental.findOne({ slug: r.slug });
      if (existing) {
        console.log(`Rental "${r.slug}" already exists. Updating...`);
        await Rental.updateOne({ slug: r.slug }, { $set: r });
      } else {
        console.log(`Creating rental "${r.slug}"...`);
        await Rental.create(r);
      }
    }

    // Clear Redis Cache
    try {
      await cacheDelPattern('rentals:*');
      console.log('Cleared rentals Redis cache successfully');
    } catch (e) {
      console.warn('Redis cache clear notice:', e.message);
    }

    // Also update seed/rentals.json
    const seedPath = path.join(__dirname, '..', 'seed', 'rentals.json');
    const seedRaw = await fs.readFile(seedPath, 'utf8');
    const seedList = JSON.parse(seedRaw);
    for (const r of newRentals) {
      const idx = seedList.findIndex(item => item.slug === r.slug);
      if (idx >= 0) {
        seedList[idx] = r;
      } else {
        seedList.push(r);
      }
    }
    await fs.writeFile(seedPath, JSON.stringify(seedList, null, 2), 'utf8');
    console.log('Updated backend/seed/rentals.json');

    const total = await Rental.countDocuments();
    const cities = await Rental.distinct('city');
    console.log(`All done! Total rentals in DB: ${total}. Cities:`, cities);

    process.exit(0);
  } catch (err) {
    console.error('Error adding rentals:', err);
    process.exit(1);
  }
}

run();
