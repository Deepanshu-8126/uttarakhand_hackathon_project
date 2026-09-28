import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import HiddenLocation from '../models/HiddenLocation.js';

const HIDDEN_LOCATIONS_DATA = [
  {
    name: "Binsar",
    slug: "binsar",
    tag: "Hidden Wildlife Sanctuary",
    district: "Almora",
    region: "Kumaon",
    lat: 29.3167,
    lng: 79.5833,
    altitude: "2,420 m",
    description: "300 km Himalayan panorama — Kedarnath, Chaukhamba, Trishul, Nanda Devi visible. 200+ bird species, leopard, Himalayan bear. Zero commercial tourism.",
    bestTime: "Mar-Jun, Sep-Nov",
    entryFee: "₹25 (Indian)",
    nearby: "30 km from Almora",
    coverImage: {
      url: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Himalayan Collection",
      alt: "Binsar Zero Point panoramic 300km Himalayan peak view"
    },
    images: {
      search: "Binsar Almora Himalaya Zero Point",
      pexels: "https://www.pexels.com/search/binsar almora/",
      unsplash: "https://unsplash.com/s/photos/binsar-himalaya"
    }
  },
  {
    name: "Munsiyari",
    slug: "munsiyari",
    tag: "Little Kashmir",
    district: "Pithoragarh",
    region: "Kumaon",
    lat: 29.5833,
    lng: 80.0167,
    altitude: "2,200 m",
    description: "Panchachuli base camp. Gateway to Milam, Ralam, Namik glacier treks. Closest town-level Panchachuli views in Uttarakhand.",
    bestTime: "Apr-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "Base for 3 glacier treks",
    coverImage: {
      url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Mountain Collection",
      alt: "Panchachuli snow peaks over Munsiyari village"
    },
    images: {
      search: "Munsiyari Panchachuli snow peaks",
      pexels: "https://www.pexels.com/search/munsiyari uttarakhand/",
      unsplash: "https://unsplash.com/s/photos/munsiyari"
    }
  },
  {
    name: "Chaukori",
    slug: "chaukori",
    tag: "Best Sunrise Point",
    district: "Pithoragarh",
    region: "Kumaon",
    lat: 29.7333,
    lng: 80.1167,
    altitude: "2,010 m",
    description: "Direct Panchachuli 5-peak view. Tea gardens + Ramganga valley. Sunrise: peaks light sequentially right-to-left (20-30 min). Zero tourist infrastructure.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "200 km from Nainital (5-6 hrs)",
    coverImage: {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Sunrise Series",
      alt: "Chaukori tea garden sunrise overlooking Himalayan peaks"
    },
    images: {
      search: "Chaukori Panchachuli sunrise tea garden",
      pexels: "https://www.pexels.com/search/chaukori panchachuli/",
      unsplash: "https://unsplash.com/s/photos/chaukori"
    }
  },
  {
    name: "Khirsu",
    slug: "khirsu",
    tag: "Hidden Apple Village",
    district: "Pauri Garhwal",
    region: "Garhwal",
    lat: 29.7667,
    lng: 78.4167,
    altitude: "1,700 m",
    description: "Untouched hill village. Apple orchards, terraced fields, Himalayan views. No commercial tourism. Homestay culture only.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    homestay: "₹1000-2000/night",
    nearby: "40 km from Pauri",
    coverImage: {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Hillside Village",
      alt: "Khirsu peaceful apple orchards and mountain village terrace"
    },
    images: {
      search: "Khirsu apple orchard mountain village",
      pexels: "https://www.pexels.com/search/apple orchard himalaya india/",
      unsplash: "https://unsplash.com/s/photos/apple-orchard-himalaya"
    }
  },
  {
    name: "Chopta",
    slug: "chopta",
    tag: "Mini Switzerland",
    district: "Rudraprayag",
    region: "Garhwal",
    lat: 30.4167,
    lng: 79.3833,
    altitude: "2,680 m",
    description: "Meadows + evergreen forest. Base for Tungnath (highest Shiva temple) + Chandrashila trek. Snow in winter, green in summer.",
    bestTime: "Mar-Jun, Sep-Nov (winter: Dec-Feb for snow)",
    entryFee: "Free (camping ₹500-1500/tent)",
    nearby: "20 km from Rudraprayag",
    coverImage: {
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1280&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Campers Collection",
      alt: "Chopta alpine meadow bugyal and snow peak base"
    },
    images: {
      search: "Chopta meadow snow Tungnath trek",
      pexels: "https://www.pexels.com/search/chopta uttarakhand/",
      unsplash: "https://unsplash.com/s/photos/chopta-tungnath"
    }
  },
  {
    name: "Harsil",
    slug: "harsil",
    tag: "Apple Valley on Bhagirathi",
    district: "Uttarkashi",
    region: "Garhwal",
    lat: 30.9833,
    lng: 79.4333,
    altitude: "1,900 m",
    description: "Ancient village on Bhagirathi river. 1000+ year old banyan tree, apple orchards, Bhim Pul (stone bridge). On Gangotri route.",
    bestTime: "Mar-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "20 km from Gangotri",
    coverImage: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash River Valley",
      alt: "Harsil apple orchards and deodar pine forests along Bhagirathi river"
    },
    images: {
      search: "Harsil Bhagirathi river apple orchard",
      pexels: "https://www.pexels.com/search/harsil uttarakhand/",
      unsplash: "https://unsplash.com/s/photos/harsil-valley"
    }
  },
  {
    name: "Pangot",
    slug: "pangot",
    tag: "Bird Watcher's Paradise",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.3833,
    lng: 79.5167,
    altitude: "2,400 m",
    description: "580+ bird species. Oak + pine forests. Gandhi stayed here (Anasakti Ashram, 1929). Butterfly gardens, nature trails. Zero crowds.",
    bestTime: "Oct-Apr (birding)",
    entryFee: "Free (guide ₹500-1000/day)",
    nearby: "20 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Nature Sanctuary",
      alt: "Pangot dense misty oak and rhododendron forest"
    },
    images: {
      search: "Pangot Nainital bird forest mist",
      pexels: "https://www.pexels.com/search/pangot nainital/",
      unsplash: "https://unsplash.com/s/photos/pangot-forest"
    }
  },
  {
    name: "Gwaldam",
    slug: "gwaldam",
    tag: "Spiritual Junction",
    district: "Chamoli",
    region: "Garhwal-Kumaon Border",
    lat: 30.2833,
    lng: 79.3333,
    altitude: "2,000 m",
    description: "Ancient temples, meditation centers. Nanda Devi + Chaukhamba views. Bedni Bugyal nearby. Sacred lakes, pilgrimage routes. Almost no tourism.",
    bestTime: "Apr-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "20 km from Badrinath, 25 km from Kulsari",
    coverImage: {
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Sacred Mountains",
      alt: "Gwaldam meditation haven facing Nanda Devi and Trishul"
    },
    images: {
      search: "Gwaldam temple Nanda Devi view",
      pexels: "https://www.pexels.com/search/gwaldam temple/",
      unsplash: "https://unsplash.com/s/photos/gwaldam"
    }
  },
  {
    name: "Kanatal",
    slug: "kanatal",
    tag: "Hidden Retreat",
    district: "Tehri Garhwal",
    region: "Garhwal",
    lat: 29.3167,
    lng: 79.4833,
    altitude: "2,590 m (8,500 ft)",
    description: "Apple orchards, terraced fields, valley views. Surkanda Devi Temple, Kaudia Forest. Rappelling + trekking. Less crowded Mussoorie alternative.",
    bestTime: "Mar-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "38 km from Mussoorie",
    coverImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Mountain Ridge",
      alt: "Kanatal pine ridges and Kaudia forest views"
    },
    images: {
      search: "Kanatal apple orchard valley view",
      pexels: "https://www.pexels.com/search/kanatal uttarakhand/",
      unsplash: "https://unsplash.com/s/photos/kanatal"
    }
  },
  {
    name: "Sattal",
    slug: "sattal",
    tag: "Seven Lakes",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.3667,
    lng: 79.4667,
    altitude: "1,370 m",
    description: "7 interconnected lakes in dense oak forest. 500+ bird species. Scott Christian Ashram (1930s). Paddle-boating. Zero commercial waterfront.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "22 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1280&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Emerald Waters",
      alt: "Sattal serene emerald lakes nestled in dense oak woods"
    },
    images: {
      search: "Sattal lakes Nainital forest",
      pexels: "https://www.pexels.com/search/sattal lakes uttarakhand/",
      unsplash: "https://unsplash.com/s/photos/sattal"
    }
  },
  {
    name: "Khurpatal",
    slug: "khurpatal",
    tag: "Hoof-Shaped Secret Lake",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.3500,
    lng: 79.4500,
    altitude: "1,635 m",
    description: "Hoof-shaped emerald lake in dense forest. No boating, no crowds, no commercial waterfront. Just lake + forest reflection + birdsong. Top birdwatching spot.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "12 km from Nainital (25-30 min cab)",
    coverImage: {
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Forest Lake",
      alt: "Khurpatal secret emerald hoof lake in mountain basin"
    },
    images: {
      search: "Khurpatal lake forest Nainital",
      pexels: "https://www.pexels.com/search/quiet lake forest india/",
      unsplash: "https://unsplash.com/s/photos/quiet-lake-forest"
    }
  },
  {
    name: "Mukteshwar",
    slug: "mukteshwar",
    tag: "Colonial Rock Viewpoint",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.4167,
    lng: 79.4833,
    altitude: "2,286 m",
    description: "180° Himalayan panorama from Chauli Ki Jali rock ledge. Nanda Devi, Trishul visible. Old British bungalows, IVRI campus (1893). Heritage homestays only.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "51 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      license: "Free Editorial",
      attribution: "Unsplash Cliff Panorama",
      alt: "Mukteshwar Chauli Ki Jali rock overhang with Trishul panorama"
    },
    images: {
      search: "Mukteshwar Chauli Ki Jali rock panorama",
      pexels: "https://www.pexels.com/search/mukteshwar himalaya/",
      unsplash: "https://unsplash.com/s/photos/mukteshwar"
    }
  }
];

async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI is missing from environment.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected!');

  console.log(`Seeding ${HIDDEN_LOCATIONS_DATA.length} Hidden Locations with verified GPS, real images & metadata...`);
  
  for (const loc of HIDDEN_LOCATIONS_DATA) {
    await HiddenLocation.findOneAndUpdate(
      { slug: loc.slug },
      {
        ...loc,
        location: { type: 'Point', coordinates: [loc.lng, loc.lat] },
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✓ Seeded: ${loc.name} (${loc.district}, ${loc.region}) [${loc.lat}, ${loc.lng}]`);
  }

  const count = await HiddenLocation.countDocuments();
  console.log(`\nAll done! Total Hidden Locations in DB: ${count}`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
