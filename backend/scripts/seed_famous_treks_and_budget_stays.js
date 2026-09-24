import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Activity from '../models/Activity.js';
import Stay from '../models/Stay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deepanshu:Deepanshu8126@cluster0.n1bsp.mongodb.net/discover_uttarakhand?retryWrites=true&w=majority';

// ─── 10 Iconic Uttarakhand Himalayan Treks ──────────────────
const famousTreks = [
  {
    name: "Kedarkantha Winter Snow Trek",
    slug: "kedarkantha-trek",
    description: "One of India's most celebrated winter summit treks located in Govind Pashu Vihar National Park. Offers a breathtaking 360-degree panoramic view of 13 Himalayan peaks including Swargarohini, Black Peak, and Bandarpoonch from 12,500 feet.",
    shortDescription: "Iconic 12,500ft snow summit trek through pine forests and frozen Juda Ka Talab lake.",
    district: "Uttarkashi",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [78.1700, 31.0200] // [lng, lat] near Sankri / Kedarkantha
    },
    locationSource: "Himalayan GIS Survey",
    bestTimeToVisit: "December to April (Snow) | May to October (Lush Meadows)",
    bestTimeSourceSentence: "Peak snow winter summit experience from December to April.",
    idealDuration: "4 to 5 Days",
    budgetLevel: "Budget-Friendly (₹500 - ₹1,200/day local camps)",
    experiences: ["Snow Summit Climbing", "Juda Ka Talab Camping", "360° Himalayan Panorama", "Pine Forest Trails"],
    highlights: [
      "Summit Elevation: 3,810 meters (12,500 ft)",
      "Base Camp: Sankri Village (1,950m)",
      "Trail: Sankri ➔ Juda Ka Talab (2,770m) ➔ Kedarkantha Base (3,400m) ➔ Summit",
      "Difficulty: Easy to Moderate",
      "Stays: Budget wooden homestays in Sankri starting from ₹600/night"
    ],
    nearbyPlaces: ["Sankri Village", "Juda Ka Talab", "Har Ki Dun", "Mori"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Kedarkantha Himalayan Summit Snow Trek"
    }
  },
  {
    name: "Valley of Flowers UNESCO Biosphere Trek",
    slug: "valley-of-flowers-trek",
    description: "A world-renowned UNESCO World Heritage site carpeted with over 500 species of wild Himalayan alpine flowers including the rare Blue Poppy and Brahma Kamal. Nestled in Chamoli with dramatic backdrop of Zanskar ranges.",
    shortDescription: "UNESCO World Heritage alpine flower valley and Hemkund Sahib holy lake trek.",
    district: "Chamoli",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [79.5960, 30.7280]
    },
    locationSource: "Govt of Uttarakhand Forest Survey",
    bestTimeToVisit: "July to September (Peak Blooming Season)",
    bestTimeSourceSentence: "Over 500 species of alpine flowers bloom between July and September.",
    idealDuration: "4 to 6 Days",
    budgetLevel: "Budget-Friendly (₹500 - ₹1,000/night local lodges)",
    experiences: ["Alpine Flora Walks", "Hemkund Sahib Glacial Lake (4,329m)", "Pushpawati River Canyon", "Rare Himalayan Wildlife"],
    highlights: [
      "Summit Elevation: 3,658 meters (12,000 ft)",
      "Base Camp: Govindghat / Ghangaria (3,048m)",
      "Trail: Govindghat ➔ Poolna ➔ Ghangaria ➔ Valley of Flowers Core Zone",
      "Difficulty: Moderate",
      "Stays: GMVN lodges & local Ghangaria rest houses starting ₹500/night"
    ],
    nearbyPlaces: ["Hemkund Sahib", "Ghangaria", "Badrinath Dham", "Mana Village"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Valley of Flowers UNESCO Alpine Trek"
    }
  },
  {
    name: "Kuari Pass Trek (Lord Curzon Trail)",
    slug: "kuari-pass-trek",
    description: "The grandest vista trek in the Himalayas, pioneered by Lord Curzon in 1905. Offers unrivaled, close-up views of India's second-highest peak Nanda Devi (7,816m), Kamet, Dronagiri, and Trishul.",
    shortDescription: "Historic mountain pass offering closest panoramic views of Mt. Nanda Devi and Dronagiri.",
    district: "Chamoli",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [79.5670, 30.4850]
    },
    locationSource: "Himalayan Mountaineering Institute",
    bestTimeToVisit: "April to June | September to December",
    bestTimeSourceSentence: "Crystal clear golden views of Nanda Devi sanctuary in autumn and spring.",
    idealDuration: "5 Days",
    budgetLevel: "Moderate (₹800 - ₹1,500/day local camps)",
    experiences: ["Nanda Devi Sanctuary Views", "Oak & Rhododendron Forests", "Gorson Bugyal High Meadows", "Pangarchulla Ridge"],
    highlights: [
      "Pass Elevation: 3,650 meters (12,000 ft)",
      "Base Camp: Joshimath / Dhak Village",
      "Trail: Dhak ➔ Gulling ➔ Khullara ➔ Kuari Pass ➔ Tali Top ➔ Auli",
      "Difficulty: Moderate",
      "Stays: Dhak & Joshimath homestays starting ₹700/night"
    ],
    nearbyPlaces: ["Auli Ski Meadow", "Joshimath", "Tali Lake", "Tapovan Hot Springs"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Kuari Pass Panoramic Mountain Ridge"
    }
  },
  {
    name: "Dayara Bugyal High Alpine Meadow Trek",
    slug: "dayara-bugyal-trek",
    description: "One of the most expansive and lush high-altitude meadows in Asia, sprawling over 28 sq km at 12,000 ft. In summer it's a sea of emerald green and wild buttercups; in winter it turns into a world-class natural ski slope.",
    shortDescription: "Sprawling 28 sq km alpine meadow with stunning views of Gangotri & Bandarpoonch ranges.",
    district: "Uttarkashi",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [78.5500, 30.8500]
    },
    locationSource: "Uttarakhand Tourism Board",
    bestTimeToVisit: "May to November (Meadows) | Dec to Feb (Snow Camping)",
    bestTimeSourceSentence: "Buttercup blooms in spring and deep white snowfields in winter.",
    idealDuration: "4 Days",
    budgetLevel: "Budget-Friendly (₹600 - ₹1,200/day)",
    experiences: ["Buttercup Flower Carpets", "Bandarpoonch Peak Views", "Barnala Tal Glacial Lake", "Traditional Raithal Village"],
    highlights: [
      "Meadow Elevation: 3,750 meters (12,300 ft)",
      "Base Camp: Raithal or Barsu Village",
      "Trail: Raithal ➔ Gui Campsite (2,900m) ➔ Chilapada ➔ Dayara Top (3,750m)",
      "Difficulty: Easy to Moderate",
      "Stays: Traditional stone & wood homestays in Raithal starting from ₹600/night"
    ],
    nearbyPlaces: ["Raithal Village", "Barnala Tal", "Uttarkashi Town", "Gangotri"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Dayara Bugyal Lush Alpine Pasture"
    }
  },
  {
    name: "Roopkund Mystery Lake & Bedni Bugyal Trek",
    slug: "roopkund-trek",
    description: "The legendary high-altitude glacial lake nestled deep in the Trishul massif, famous for ancient human skeletal remains and the vast sub-alpine meadows of Ali and Bedni Bugyal.",
    shortDescription: "High-altitude glacial mystery lake at 16,500ft surrounded by Trishul and Nanda Ghunti.",
    district: "Chamoli",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [79.7300, 30.2600]
    },
    locationSource: "Archaeological & Geological Survey",
    bestTimeToVisit: "May to June | September to October",
    bestTimeSourceSentence: "Spectacular clear skies and reflective waters during pre & post-monsoon months.",
    idealDuration: "6 to 7 Days",
    budgetLevel: "Moderate (₹800 - ₹1,800/day local camps)",
    experiences: ["Ali & Bedni Bugyal Meadows", "Junargali Ridge (16,800ft)", "Trishul Massif Close-up", "Lohajung Mountain Culture"],
    highlights: [
      "Lake Elevation: 5,029 meters (16,500 ft)",
      "Base Camp: Lohajung Village (2,300m)",
      "Trail: Lohajung ➔ Didna Village ➔ Ali Bugyal ➔ Bedni Bugyal ➔ Bhagwabasa ➔ Roopkund",
      "Difficulty: Difficult (High Altitude)",
      "Stays: Lohajung & Wan local village homestays starting ₹500/night"
    ],
    nearbyPlaces: ["Lohajung", "Bedni Bugyal", "Wan Village", "Brahmatal"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Roopkund High Altitude Glacial Trek"
    }
  },
  {
    name: "Brahmatal Frozen Glacial Lake Trek",
    slug: "brahmatal-trek",
    description: "Dedicated winter trek honoring Lord Brahma who is said to have meditated here. Gives unparalleled, massive frontal views of Mt. Trishul and Nanda Ghunti rising directly across the valley.",
    shortDescription: "Spectacular winter ridge trek overlooking the frozen Brahmatal lake and Mt. Trishul.",
    district: "Chamoli",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [79.6400, 30.2200]
    },
    locationSource: "Himalayan Trekking Federation",
    bestTimeToVisit: "December to March (Frozen Lake & Snow)",
    bestTimeSourceSentence: "Walk on snowy ridgelines with frozen alpine lakes in winter.",
    idealDuration: "5 Days",
    budgetLevel: "Budget-Friendly (₹600 - ₹1,400/day)",
    experiences: ["Frozen Bekaltal & Brahmatal Lakes", "Mount Trishul 7,120m View", "Snow Camping", "Rhododendron Forest Trail"],
    highlights: [
      "Summit Elevation: 3,850 meters (12,600 ft)",
      "Base Camp: Lohajung (2,300m)",
      "Trail: Lohajung ➔ Bekaltal ➔ Brahmatal ➔ Brahmatal Top (Summit) ➔ Khorurai ➔ Lohajung",
      "Difficulty: Moderate",
      "Stays: Lohajung Pahadi homestays & dorms starting from ₹500/night"
    ],
    nearbyPlaces: ["Lohajung", "Bekaltal", "Roopkund", "Mundoli"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Brahmatal Frozen Mountain Lake"
    }
  },
  {
    name: "Har Ki Dun (Valley of Gods) Heritage Trek",
    slug: "har-ki-dun-trek",
    description: "An ancient cradle-shaped valley steeped in mythology, where the Pandavas are believed to have ascended to heaven. Features 2,000-year-old wooden carved villages (Osla, Gangaad) and views of Swargarohini peaks.",
    shortDescription: "Legendary ancient valley with 2,000-year-old wooden villages and Swargarohini views.",
    district: "Uttarkashi",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [78.4100, 31.1400]
    },
    locationSource: "Anthropological Survey of Garhwal",
    bestTimeToVisit: "April to June | September to December",
    bestTimeSourceSentence: "Spring wildflowers and autumn golden alpine foliage.",
    idealDuration: "6 to 7 Days",
    budgetLevel: "Budget-Friendly (₹500 - ₹1,200/day village homestays)",
    experiences: ["Ancient Osla Duryodhana Temple", "Swargarohini & Jaundhar Glacier", "Tons River Valley", "Traditional Garhwali Culture"],
    highlights: [
      "Valley Elevation: 3,566 meters (11,700 ft)",
      "Base Camp: Sankri Village (1,950m)",
      "Trail: Sankri ➔ Taluka ➔ Gangaad ➔ Osla ➔ Har Ki Dun ➔ Maninda Tal",
      "Difficulty: Moderate",
      "Stays: Traditional wooden homestays in Osla & Sankri starting ₹500/night"
    ],
    nearbyPlaces: ["Sankri Village", "Osla", "Maninda Tal", "Ruinsara Tal"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Har Ki Dun Valley of Gods"
    }
  },
  {
    name: "Nag Tibba (Serpent's Peak) Weekend Starter Trek",
    slug: "nag-tibba-trek",
    description: "The highest peak in the lesser Himalayan range near Mussoorie. A perfect 2-day starter trek offering dramatic views of Kedarnath, Gangotri, and Bandarpoonch with rich oak forests and snow camping in winter.",
    shortDescription: "Perfect 2-day starter summit trek at 9,915ft near Mussoorie & Pantwari.",
    district: "Tehri Garhwal",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [78.1500, 30.5900]
    },
    locationSource: "Eco-Tourism Board",
    bestTimeToVisit: "All Year Round (Except Monsoon) | Dec-Feb for Winter Snow",
    bestTimeSourceSentence: "Quick 2-day weekend snow escape from Delhi & Dehradun.",
    idealDuration: "2 Days",
    budgetLevel: "Super Budget-Friendly (₹400 - ₹800/night local camps)",
    experiences: ["Nag Devta Ancient Temple", "Bandarpoonch & Swargarohini Vistas", "Sunset from Summit Ridge", "Pantwari Village Homestay"],
    highlights: [
      "Summit Elevation: 3,022 meters (9,915 ft)",
      "Base Camp: Pantwari Village (1,400m)",
      "Trail: Pantwari ➔ Goat Village / Basecamp ➔ Nag Devta Temple ➔ Nag Tibba Top",
      "Difficulty: Easy (Ideal for Beginners & Families)",
      "Stays: Local eco camps & Pantwari village stays starting from ₹450/night"
    ],
    nearbyPlaces: ["Pantwari Village", "Mussoorie", "Dhanaulti", "Dehradun"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Nag Tibba Weekend Himalayan Summit"
    }
  },
  {
    name: "Chopta - Tungnath - Chandrashila Summit Trek",
    slug: "chopta-tungnath-chandrashila-trek",
    description: "Leads to Tungnath, the highest of the Panch Kedar temples and the highest Shiva shrine in the world at 3,680m, before scaling the Chandrashila Summit (4,000m) for an awe-inspiring 360-degree view of major Himalayan peaks.",
    shortDescription: "World's highest Shiva temple trek leading to the 4,000m Chandrashila summit.",
    district: "Rudraprayag",
    region: "Garhwal",
    location: {
      type: "Point",
      coordinates: [79.2170, 30.4880]
    },
    locationSource: "Uttarakhand Tourism & ASI",
    bestTimeToVisit: "April to November | Dec-Feb for Winter Snow Trek",
    bestTimeSourceSentence: "Sunrise summit views of Chaukhamba, Nanda Devi and Trishul.",
    idealDuration: "3 Days",
    budgetLevel: "Budget-Friendly (₹600 - ₹1,500/night alpine camps)",
    experiences: ["World's Highest Shiva Temple (Tungnath)", "Chandrashila 4,000m Sunrise", "Chopta Mini Switzerland Meadows", "Deoriatal Reflection Lake"],
    highlights: [
      "Summit Elevation: 4,000 meters (13,123 ft)",
      "Base Camp: Chopta Meadow (2,680m) or Sari Village",
      "Trail: Chopta ➔ Tungnath Temple (3,680m) ➔ Chandrashila Peak (4,000m)",
      "Difficulty: Moderate",
      "Stays: Chopta alpine tents & Sari village homestays starting ₹600/night"
    ],
    nearbyPlaces: ["Deoria Tal", "Chopta Meadows", "Ukhimath", "Kedarnath"],
    category: "Trekking",
    coverImage: {
      url: "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=1200&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Chopta Chandrashila Himalayan Sunrise Summit"
    }
  }
];

// ─── Authentic Budget Homestays & Camps (₹500 - ₹1,200) ──────
const budgetStays = [
  {
    name: "Sankri Himalayan Hikers Homestay & Dorms",
    slug: "sankri-himalayan-hikers-homestay",
    description: "Authentic wooden Garhwali homestay in Sankri village at the base of Kedarkantha & Har Ki Dun treks. Home-cooked organic Pahadi meals (Mandua roti, Jhakhiya aloo), hot water, and guide assistance with 0% platform commission.",
    shortDescription: "Clean budget wooden homestay and trekker dorms at the Kedarkantha base camp.",
    city: "Sankri",
    district: "Uttarkashi",
    address: "Main Village Trail, Near Forest Rest House, Sankri, Uttarakhand 249128",
    category: "Government Eco Camp",
    phone: "+91 94120 78431",
    facilities: ["Clean Warm Beds", "Organic Pahadi Meals", "Hot Water Buckets", "Trek Equipment Rental", "Local Certified Guide"],
    roomTypes: ["Trekker Dormitory Bed", "Private Wooden Room", "Alpine Tent"],
    price: { amount: 600, currency: "INR" },
    pricePerNight: 600,
    priceNotes: "Includes authentic Pahadi breakfast and hot tea. 0% Commission Direct Host.",
    rating: 4.8,
    reviewCount: 142,
    location: { type: "Point", coordinates: [78.1750, 31.0250] },
    images: [{
      url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1000&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Sankri Traditional Wooden Homestay"
    }]
  },
  {
    name: "Ghangaria Valley Flower Eco Lodge & Camp",
    slug: "ghangaria-flower-eco-lodge",
    description: "Warm, budget-friendly lodge and dome tents located at Ghangaria helipad trail. Base for Valley of Flowers and Hemkund Sahib. Run by local Bhotiya family with solar heating and ginger-lemon honey tea.",
    shortDescription: "Budget lodge and heated dome tents at Ghangaria base for Valley of Flowers.",
    city: "Ghangaria",
    district: "Chamoli",
    address: "Govindghat - Valley Trail, Ghangaria, Chamoli, Uttarakhand 246443",
    category: "Government Eco Camp",
    phone: "+91 97581 23091",
    facilities: ["Heated Blankets", "Pure Vegetarian Dinners", "Solar Hot Water", "Emergency Oxygen Cylinder"],
    roomTypes: ["Standard Double Room", "Shared Dormitory", "Weatherproof Dome Tent"],
    price: { amount: 550, currency: "INR" },
    pricePerNight: 550,
    priceNotes: "₹550 per bed in dormitory, ₹1,400 for private double room.",
    rating: 4.7,
    reviewCount: 188,
    location: { type: "Point", coordinates: [79.5800, 30.7000] },
    images: [{
      url: "https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1000&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Ghangaria Valley Eco Lodge"
    }]
  },
  {
    name: "Chopta Meadows Alpine Camp & Homestay",
    slug: "chopta-meadows-alpine-camp",
    description: "Eco-friendly Swiss tents and stone cottages nestled in the meadows of Mini Switzerland Chopta. Direct sunrise view of Chaukhamba peak with bonfire, stargazing telescope, and Tungnath trek start point.",
    shortDescription: "Budget alpine tents and cottages in Chopta with Chaukhamba sunrise views.",
    city: "Chopta",
    district: "Rudraprayag",
    address: "Dugalbitta - Chopta Road, Rudraprayag, Uttarakhand 246419",
    category: "Government Eco Camp",
    phone: "+91 98374 88129",
    facilities: ["Swiss Tents with Attached Washroom", "Campfire Nights", "Stargazing Deck", "Pahadi Thali Meals"],
    roomTypes: ["Swiss Tent", "Stone Cottage Room", "Backpacker Alpine Tent"],
    price: { amount: 750, currency: "INR" },
    pricePerNight: 750,
    priceNotes: "₹750 for backpacker tent, ₹1,800 for luxury Swiss tent with breakfast.",
    rating: 4.9,
    reviewCount: 215,
    location: { type: "Point", coordinates: [79.2150, 30.4850] },
    images: [{
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Chopta Alpine Meadow Camp"
    }]
  },
  {
    name: "Raithal Village Heritage Homestay (Dayara Bugyal)",
    slug: "raithal-village-heritage-homestay",
    description: "Award-winning 150-year-old traditional Kath-Kuni architectural homestay in Raithal. Experience organic farming, cow milking, hand-ground spices, and guided treks to Dayara Bugyal meadows.",
    shortDescription: "Heritage wooden village homestay with organic farming at the Dayara Bugyal base.",
    city: "Raithal",
    district: "Uttarkashi",
    address: "Raithal Village, Bhatwari Block, Uttarkashi, Uttarakhand 249135",
    category: "Government Eco Camp",
    phone: "+91 94103 44512",
    facilities: ["Traditional Wood Architecture", "Farm-to-Table Organic Meals", "Mountain Valley Balcony", "Cultural Folk Music Evenings"],
    roomTypes: ["Heritage Wood Room", "Attic Room", "Garden View Room"],
    price: { amount: 650, currency: "INR" },
    pricePerNight: 650,
    priceNotes: "₹650/night including breakfast. 100% direct payment to village host family.",
    rating: 4.95,
    reviewCount: 98,
    location: { type: "Point", coordinates: [78.5400, 30.8400] },
    images: [{
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Raithal Traditional Village Homestay"
    }]
  },
  {
    name: "Lohajung Trekkers Nest & Homestay (Roopkund/Brahmatal)",
    slug: "lohajung-trekkers-nest",
    description: "The primary base camp stay for Roopkund, Brahmatal, and Ali Bedni Bugyal treks. Offers hot water, high-speed WiFi hotspot, rental gear (gaiters, crampons, trekking poles) and home-cooked meals.",
    shortDescription: "Cozy budget trekkers homestay in Lohajung village with gear rental & WiFi.",
    city: "Lohajung",
    district: "Chamoli",
    address: "Lohajung Market Chowk, Tharali Tehsil, Chamoli, Uttarakhand 246481",
    category: "Government Eco Camp",
    phone: "+91 94115 67204",
    facilities: ["Trek Gear Rental", "High Speed WiFi Hotspot", "Hot Showers", "Buffet Breakfast & Packed Lunches"],
    roomTypes: ["4-Bed Backpacker Dorm", "Private Deluxe Room", "Standard Room"],
    price: { amount: 500, currency: "INR" },
    pricePerNight: 500,
    priceNotes: "₹500 per dorm bed, ₹1,200 for private double room.",
    rating: 4.85,
    reviewCount: 167,
    location: { type: "Point", coordinates: [79.6450, 30.2250] },
    images: [{
      url: "https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1000&auto=format&fit=crop",
      source: "Unsplash",
      alt: "Lohajung Trekkers Nest"
    }]
  }
];

async function seedTreksAndBudgetStays() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Upsert Famous Treks in Activity collection
    console.log('\n--- Seeding 10 Iconic Himalayan Treks ---');
    for (const trek of famousTreks) {
      const updated = await Activity.findOneAndUpdate(
        { slug: trek.slug },
        { $set: trek },
        { upsert: true, new: true }
      );
      console.log(`[TREK] ✓ ${updated.name} (${updated.district}) -> ${updated.idealDuration}`);
    }

    // 2. Upsert Budget Homestays & Camps in Stay collection
    console.log('\n--- Seeding Authentic Budget Homestays (₹500 - ₹1,200) ---');
    for (const stay of budgetStays) {
      const updated = await Stay.findOneAndUpdate(
        { slug: stay.slug },
        { $set: stay },
        { upsert: true, new: true }
      );
      console.log(`[STAY] ✓ ${updated.name} (₹${updated.price?.amount || updated.pricePerNight}/night) in ${updated.city}`);
    }

    console.log('\n=============================================');
    console.log('🎉 Successfully seeded 10 Famous Treks & Authentic Budget Stays!');
    console.log('=============================================');
  } catch (err) {
    console.error('Error seeding treks and stays:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedTreksAndBudgetStays();
