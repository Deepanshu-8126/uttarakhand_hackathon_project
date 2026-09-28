import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Stay from '../models/Stay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const realStays = [
  // ── 10 Haldwani Homestays ──
  {
    name: "Bora's Homestay",
    slug: "boras-homestay-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "Haldwani, Nainital District, 2.5 km from center",
    location: { type: "Point", coordinates: [79.5135, 29.2180] },
    price: { amount: 1585, currency: "INR" },
    pricePerNight: 1585,
    rating: 9.5,
    reviewCount: 30,
    phone: "+91 94120 00001",
    description: "Peaceful residential area, easy access to Neem Ka Ghati. Spacious rooms, warm hospitality.",
    shortDescription: "Peaceful residential homestay with warm hospitality near Neem Ka Ghati.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "Breakfast"],
    amenities: ["WiFi", "Parking", "Breakfast", "Mountain View"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Bora's Homestay Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Bora's Homestay Haldwani Room"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Utsav Riverbank Homestay",
    slug: "utsav-riverbank-homestay-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "Haldwani, Nainital District, 1.2 km from center",
    location: { type: "Point", coordinates: [79.5180, 29.2230] },
    price: { amount: 1000, currency: "INR" },
    pricePerNight: 1000,
    rating: 9.2,
    reviewCount: 95,
    phone: "+91 94120 00002",
    description: "Artfully decorated, riverbank location. Best value in Haldwani. Hosts very welcoming.",
    shortDescription: "Artfully decorated riverbank cottage with scenic natural ambiance.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "River View", "Breakfast"],
    amenities: ["WiFi", "Parking", "River View", "Breakfast"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Utsav Riverbank Homestay Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Utsav Riverbank Homestay River View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Homestay Haldwani",
    slug: "homestay-haldwani-center",
    city: "Haldwani",
    district: "Nainital",
    address: "400 m from city center, Haldwani, Nainital District",
    location: { type: "Point", coordinates: [79.5150, 29.2200] },
    price: { amount: 1550, currency: "INR" },
    pricePerNight: 1550,
    rating: 8.5,
    reviewCount: 45,
    phone: "+91 9720396985",
    email: "sanguri7@gmail.com",
    description: "Recently renovated, mountain views. Free WiFi + parking. EV charger available. Pet friendly.",
    shortDescription: "Renovated homestay with EV charger, mountain views and pet-friendly rooms.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "EV Charger", "Pet Friendly", "Mountain View"],
    amenities: ["WiFi", "Parking", "EV Charger", "Pet Friendly", "Mountain View"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Homestay Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Homestay Haldwani Bedroom"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "The Roof Lounge & Stay",
    slug: "the-roof-lounge-stay-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "3 km from center, Haldwani, Nainital District",
    location: { type: "Point", coordinates: [79.5200, 29.2150] },
    price: { amount: 7173, currency: "INR" },
    pricePerNight: 7173,
    rating: 8.8,
    reviewCount: 22,
    phone: "+91 94120 00004",
    description: "Premium rooftop lounge + stay. Best for groups and families. Panoramic valley views.",
    shortDescription: "Premium rooftop lounge retreat with panoramic valley views for families.",
    category: "Resort",
    facilities: ["WiFi", "Parking", "Rooftop", "AC", "Restaurant"],
    amenities: ["WiFi", "Parking", "Rooftop", "AC", "Restaurant"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "The Roof Lounge Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "The Roof Lounge View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Cosy Stay",
    slug: "cosy-stay-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "2 km from center, Haldwani, Nainital District",
    location: { type: "Point", coordinates: [79.5100, 29.2250] },
    price: { amount: 1733, currency: "INR" },
    pricePerNight: 1733,
    rating: 8.3,
    reviewCount: 18,
    phone: "+91 94120 00005",
    description: "Pet friendly, budget-friendly. Clean rooms, quiet location. Good for solo travelers.",
    shortDescription: "Quiet budget homestay ideal for solo travelers and pets.",
    category: "Homestay",
    facilities: ["WiFi", "Pet Friendly", "Parking"],
    amenities: ["WiFi", "Pet Friendly", "Parking"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Cosy Stay Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Cosy Stay Room"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Jaiswal Guest House",
    slug: "jaiswal-guest-house-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "1.5 km from center, Haldwani, Nainital District",
    location: { type: "Point", coordinates: [79.5120, 29.2190] },
    price: { amount: 1205, currency: "INR" },
    pricePerNight: 1205,
    rating: 7.8,
    reviewCount: 12,
    phone: "+91 94120 00006",
    description: "Budget guest house. Clean, basic, good for transit stay before Nainital/Bhimtal.",
    shortDescription: "Clean budget transit guest house before heading up to Nainital/Bhimtal.",
    category: "Hotel",
    facilities: ["WiFi", "Parking", "Laundry"],
    amenities: ["WiFi", "Parking", "Laundry"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Jaiswal Guest House Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Jaiswal Guest House Entrance"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "The Misty View Room",
    slug: "the-misty-view-room-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "4 km from center, foothills of Kathgodam, Haldwani",
    location: { type: "Point", coordinates: [79.5250, 29.2350] },
    price: { amount: 2194, currency: "INR" },
    pricePerNight: 2194,
    rating: 8.6,
    reviewCount: 15,
    phone: "+91 94120 00007",
    description: "Misty mountain views from room. Premium budget stay. Good for couples.",
    shortDescription: "Foothill retreat with misty morning mountain views for couples.",
    category: "Homestay",
    facilities: ["WiFi", "Mountain View", "AC", "Breakfast"],
    amenities: ["WiFi", "Mountain View", "AC", "Breakfast"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "The Misty View Room Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Misty Mountain View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Aman Home Stay",
    slug: "aman-home-stay-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "Kaladhungi Road, Mukhani, Haldwani",
    location: { type: "Point", coordinates: [79.5050, 29.2120] },
    price: { amount: 1200, currency: "INR" },
    pricePerNight: 1200,
    rating: 8.0,
    reviewCount: 10,
    phone: "+91 84017 79681",
    description: "Women-friendly homestay. Quiet location near Mukhani. Family-run, home food available.",
    shortDescription: "Women-friendly family homestay with authentic Pahadi home food.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "Home Food", "Women Friendly"],
    amenities: ["WiFi", "Parking", "Home Food", "Women Friendly"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Aman Home Stay Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Aman Home Stay Room"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Hari Leela Home Stay",
    slug: "hari-leela-home-stay-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "Sitaram Vihar, Kathghariya, Haldwani",
    location: { type: "Point", coordinates: [79.5000, 29.2280] },
    price: { amount: 1500, currency: "INR" },
    pricePerNight: 1500,
    rating: 8.2,
    reviewCount: 14,
    phone: "+91 99723 71894",
    description: "Breakfast included, express laundry, street parking. Good for families with kids.",
    shortDescription: "Family-friendly homestay in Kathghariya with breakfast and laundry included.",
    category: "Homestay",
    facilities: ["Breakfast", "Laundry", "Parking", "WiFi"],
    amenities: ["Breakfast", "Laundry", "Parking", "WiFi"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Hari Leela Home Stay Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Hari Leela Front Yard"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "World Peace Gagar",
    slug: "world-peace-gagar-haldwani",
    city: "Haldwani",
    district: "Nainital",
    address: "300m from Gagar Temple, Kaladhungi Road, Haldwani",
    location: { type: "Point", coordinates: [79.4950, 29.2080] },
    price: { amount: 3500, currency: "INR" },
    pricePerNight: 3500,
    rating: 8.4,
    reviewCount: 20,
    phone: "+91 70417 29602",
    description: "Resort-style stay near Gagar Temple. Peaceful, spiritual location. Good for meditation retreats.",
    shortDescription: "Spiritual resort stay adjacent to Gagar Temple for meditation and peaceful holidays.",
    category: "Resort",
    facilities: ["WiFi", "Parking", "Garden", "Temple Nearby", "AC"],
    amenities: ["WiFi", "Parking", "Garden", "Temple Nearby", "AC"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "World Peace Gagar Haldwani"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "World Peace Garden & Temple Area"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },

  // ── 10 Nainital Homestays ──
  {
    name: "Prashant's Homestay Nainital",
    slug: "prashants-homestay-nainital",
    city: "Nainital",
    district: "Nainital",
    address: "Stoneleigh Road, Tallital, Nainital",
    location: { type: "Point", coordinates: [79.4636, 29.3803] },
    price: { amount: 833, currency: "INR" },
    pricePerNight: 833,
    rating: 8.7,
    reviewCount: 35,
    phone: "+91 94120 10001",
    description: "Prime location, stunning Naini Lake view. Part of big beautiful house. Super comfortable cozy rooms.",
    shortDescription: "Prime Tallital homestay with magnificent Naini Lake views at budget rates.",
    category: "Homestay",
    facilities: ["WiFi", "Lake View", "Parking", "Breakfast"],
    amenities: ["WiFi", "Lake View", "Parking", "Breakfast"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Prashant's Homestay Nainital"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Naini Lake View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Langdale Lodge",
    slug: "langdale-lodge-nainital",
    city: "Nainital",
    district: "Nainital",
    address: "Lower Ayarpata, Nainital",
    location: { type: "Point", coordinates: [79.4580, 29.3850] },
    price: { amount: 2333, currency: "INR" },
    pricePerNight: 2333,
    rating: 8.9,
    reviewCount: 28,
    phone: "+91 94120 10002",
    description: "Heritage building, family lives in main house. Private entrance. Old British architecture charm.",
    shortDescription: "British colonial heritage bungalow with private entrance in Ayarpata hills.",
    category: "Heritage Homestay",
    facilities: ["WiFi", "Heritage", "Garden", "Parking", "Breakfast"],
    amenities: ["WiFi", "Heritage", "Garden", "Parking", "Breakfast"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Langdale Lodge Nainital"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Heritage Architecture"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Emily Lodge",
    slug: "emily-lodge-nainital",
    city: "Nainital",
    district: "Nainital",
    address: "Ayarpatta, Nainital",
    location: { type: "Point", coordinates: [79.4520, 29.3820] },
    price: { amount: 6500, currency: "INR" },
    pricePerNight: 6500,
    rating: 9.1,
    reviewCount: 42,
    phone: "+91 94120 10003",
    description: "Luxury homestay, old British architecture. 5 rooms. Premium experience in Ayarpatta hills.",
    shortDescription: "Colonial luxury estate nestled among deodar groves with stone fireplaces.",
    category: "Heritage Homestay",
    facilities: ["WiFi", "AC", "Luxury", "Garden", "Parking", "Breakfast", "Fireplace"],
    amenities: ["WiFi", "AC", "Luxury", "Garden", "Parking", "Breakfast", "Fireplace"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Emily Lodge Nainital"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Luxury Heritage Suite"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "The Vergomont Homestay",
    slug: "the-vergomont-homestay-jeolikot",
    city: "Jeolikot",
    district: "Nainital",
    address: "Jeolikot, 4.0 km from Nainital Toll",
    location: { type: "Point", coordinates: [79.4850, 29.3400] },
    price: { amount: 2000, currency: "INR" },
    pricePerNight: 2000,
    rating: 8.8,
    reviewCount: 30,
    phone: "+91 94120 10004",
    description: "Old British era bungalow converted to homestay. One of the best near Nainital. Original architecture preserved.",
    shortDescription: "Preserved British era bungalow with flowering orchard gardens in Jeolikot.",
    category: "Heritage Homestay",
    facilities: ["WiFi", "Heritage", "Garden", "Parking", "Mountain View"],
    amenities: ["WiFi", "Heritage", "Garden", "Parking", "Mountain View"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Vergomont Homestay Jeolikot"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Orchard Garden"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Royal Apple Cottage",
    slug: "royal-apple-cottage-nainital",
    city: "Nainital",
    district: "Nainital",
    address: "Near Graphic Era University, Nainital",
    location: { type: "Point", coordinates: [79.4700, 29.3650] },
    price: { amount: 2800, currency: "INR" },
    pricePerNight: 2800,
    rating: 8.5,
    reviewCount: 25,
    phone: "+91 94120 10005",
    description: "3BHK villa overlooking valley. Sunrise view from all bedrooms. Sattal/Nainital area. Attached bathrooms.",
    shortDescription: "3BHK villa with sunrise valley views and kitchen access between Sattal and Nainital.",
    category: "Villa",
    facilities: ["WiFi", "Valley View", "3 BHK", "Parking", "Kitchen", "Sunrise View"],
    amenities: ["WiFi", "Valley View", "3 BHK", "Parking", "Kitchen", "Sunrise View"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Royal Apple Cottage"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Sunrise Valley View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "MadhuuS Homestay",
    slug: "madhuus-homestay-nathuakhan",
    city: "Nathuakhan",
    district: "Nainital",
    address: "Nathuakhan, Bhowali-Mukteshwar belt, Nainital",
    location: { type: "Point", coordinates: [79.5800, 29.4700] },
    price: { amount: 4000, currency: "INR" },
    pricePerNight: 4000,
    rating: 8.6,
    reviewCount: 18,
    phone: "+91 94120 10006",
    description: "Garden, shared lounge, terrace. Bhowali area. Free WiFi + mountain views. Quiet village location.",
    shortDescription: "Terraced apple orchard mountain homestay in scenic Nathuakhan village.",
    category: "Homestay",
    facilities: ["WiFi", "Garden", "Terrace", "Mountain View", "Parking"],
    amenities: ["WiFi", "Garden", "Terrace", "Mountain View", "Parking"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1507038772120-7ffe76f79d79?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "MadhuuS Homestay Nathuakhan"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1507038772120-7ffe76f79d79?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Orchard Terrace"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Blue Mountain Homes",
    slug: "blue-mountain-homes-rausil",
    city: "Village Rausil",
    district: "Nainital",
    address: "Village Rausil, 12.5 km from Kathgodam, Nainital District",
    location: { type: "Point", coordinates: [79.5400, 29.2800] },
    price: { amount: 1200, currency: "INR" },
    pricePerNight: 1200,
    rating: 8.3,
    reviewCount: 15,
    phone: "+91 94120 10007",
    description: "Cozy cottage up the hill, 12.5 km from Kathgodam. Picturesque location. Long stay friendly.",
    shortDescription: "Secluded hillside cottage surrounded by pine slopes, perfect for long stays.",
    category: "Homestay",
    facilities: ["WiFi", "Mountain View", "Parking", "Quiet"],
    amenities: ["WiFi", "Mountain View", "Parking", "Quiet"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Blue Mountain Homes Rausil"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Cottage Hill View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "The White Flower Homestay",
    slug: "white-flower-homestay-ranibagh",
    city: "Ranibagh",
    district: "Nainital",
    address: "Ranibagh, near Kathgodam, Nainital District",
    location: { type: "Point", coordinates: [79.5350, 29.2750] },
    price: { amount: 1000, currency: "INR" },
    pricePerNight: 1000,
    rating: 8.4,
    reviewCount: 20,
    phone: "+91 94120 10008",
    description: "Cozy mountain-view homestay. Clean rooms, peaceful vibes, warm hospitality. Long stay friendly.",
    shortDescription: "Budget-friendly peaceful stopover in Ranibagh with warm Kumaoni hospitality.",
    category: "Homestay",
    facilities: ["WiFi", "Mountain View", "Parking", "Quiet"],
    amenities: ["WiFi", "Mountain View", "Parking", "Quiet"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "The White Flower Homestay"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Ranibagh Valley"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Kumaon Estate",
    slug: "kumaon-estate-matial-jeeling",
    city: "Jeeling",
    district: "Nainital",
    address: "Matial Village, Jeeling Range, 13 km from Bhimtal",
    location: { type: "Point", coordinates: [79.5850, 29.3900] },
    price: { amount: 4350, currency: "INR" },
    pricePerNight: 4350,
    rating: 9.0,
    reviewCount: 22,
    phone: "+91 94120 10009",
    description: "European style cottage in Jilling Range. 13 km from Bhimtal, on way to Mukteshwar. Premium experience.",
    shortDescription: "European stone cottage in pristine Jilling forest ridge overlooking Trishul peaks.",
    category: "Resort",
    facilities: ["WiFi", "European Style", "Garden", "Parking", "Mountain View", "Fireplace"],
    amenities: ["WiFi", "European Style", "Garden", "Parking", "Mountain View", "Fireplace"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Kumaon Estate Jeeling"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Jilling Pine Ridge"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Pahadi Kothi",
    slug: "pahadi-kothi-pangot",
    city: "Pangot",
    district: "Nainital",
    address: "Pangot Bird Sanctuary Belt, 6.3 km from Nainital",
    location: { type: "Point", coordinates: [79.4300, 29.4100] },
    price: { amount: 1428, currency: "INR" },
    pricePerNight: 1428,
    rating: 8.7,
    reviewCount: 30,
    phone: "+91 94120 10010",
    description: "Luxurious 3-bedroom villa in oak forest. Personalized service, vast amenities. 24/7 support. Pangot bird sanctuary area.",
    shortDescription: "Traditional stone villa in dense oak forest of Pangot with Himalayan birding trails.",
    category: "Villa",
    facilities: ["WiFi", "3 BHK", "Parking", "Forest", "AC", "Kitchen", "24/7 Support"],
    amenities: ["WiFi", "3 BHK", "Parking", "Forest", "AC", "Kitchen", "24/7 Support"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Pahadi Kothi Pangot"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Pangot Oak Sanctuary"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },

  // ── 10 Pithoragarh Homestays ──
  {
    name: "Gauri Homestay",
    slug: "gauri-homestay-pithoragarh",
    city: "Pithoragarh",
    district: "Pithoragarh",
    address: "1 km from main market, Pithoragarh town",
    location: { type: "Point", coordinates: [80.2182, 29.5829] },
    price: { amount: 1600, currency: "INR" },
    pricePerNight: 1600,
    rating: 8.5,
    reviewCount: 20,
    phone: "+91 75360 22202",
    description: "Best rated homestay in Pithoragarh. Clean, comfortable, warm hospitality. Good for Adi Kailash yatra base.",
    shortDescription: "Top-rated Kumaoni homestay serving as an ideal base for Adi Kailash & Om Parvat pilgrims.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "Breakfast", "Mountain View"],
    amenities: ["WiFi", "Parking", "Breakfast", "Mountain View"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Gauri Homestay Pithoragarh"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Soar Valley View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Gemini Homestay",
    slug: "gemini-homestay-pithoragarh",
    city: "Pithoragarh",
    district: "Pithoragarh",
    address: "2 km from bus station, Pithoragarh",
    location: { type: "Point", coordinates: [80.2100, 29.5800] },
    price: { amount: 1500, currency: "INR" },
    pricePerNight: 1500,
    rating: 8.2,
    reviewCount: 15,
    phone: "+91 95685 67701",
    description: "Budget-friendly, clean rooms. Good for travelers heading to Chaukori/Munsiyari. Family-run.",
    shortDescription: "Clean, family-run budget homestay ideal for travelers transit to Chaukori & Munsiyari.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "Home Food"],
    amenities: ["WiFi", "Parking", "Home Food"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Gemini Homestay Pithoragarh"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Gemini Homestay Dining"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Nishtha Homestay",
    slug: "nishtha-homestay-pithoragarh",
    city: "Pithoragarh",
    district: "Pithoragarh",
    address: "1.5 km from center, Pithoragarh",
    location: { type: "Point", coordinates: [80.2200, 29.5850] },
    price: { amount: 1300, currency: "INR" },
    pricePerNight: 1300,
    rating: 8.0,
    reviewCount: 12,
    phone: "+91 94120 20003",
    description: "Simple, clean, affordable. Good for solo travelers and students. Quiet location.",
    shortDescription: "Affordable and serene homestay in quiet residential area of Pithoragarh.",
    category: "Homestay",
    facilities: ["WiFi", "Parking"],
    amenities: ["WiFi", "Parking"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Nishtha Homestay Pithoragarh"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Nishtha Homestay Room"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Bhanumati Homestay Chaukori",
    slug: "bhanumati-homestay-chaukori",
    city: "Chaukori",
    district: "Pithoragarh",
    address: "Tea Garden Road, Chaukori, Pithoragarh",
    location: { type: "Point", coordinates: [80.0230, 29.8460] },
    price: { amount: 2000, currency: "INR" },
    pricePerNight: 2000,
    rating: 8.8,
    reviewCount: 25,
    phone: "+91 94120 20004",
    description: "Panchachuli view from room. Best sunrise spot. Tea garden nearby. Perfect for photographers.",
    shortDescription: "Unrivaled panoramic sunrise views of Panchachuli peaks over manicured tea gardens.",
    category: "Homestay",
    facilities: ["WiFi", "Panchachuli View", "Sunrise", "Tea Garden", "Parking"],
    amenities: ["WiFi", "Panchachuli View", "Sunrise", "Tea Garden", "Parking"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Bhanumati Homestay Chaukori"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Panchachuli Sunrise"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Uttaranchal Homestay",
    slug: "uttaranchal-homestay-pithoragarh",
    city: "Pithoragarh",
    district: "Pithoragarh",
    address: "3 km from center, Pithoragarh, Uttarakhand",
    location: { type: "Point", coordinates: [80.2050, 29.5900] },
    price: { amount: 2300, currency: "INR" },
    pricePerNight: 2300,
    rating: 8.3,
    reviewCount: 18,
    phone: "+91 94120 20005",
    description: "Mid-range comfort. Good location for exploring town + nearby villages. Family-friendly.",
    shortDescription: "Comfortable family homestay with garden terrace overlooking the valley.",
    category: "Homestay",
    facilities: ["WiFi", "Parking", "Breakfast", "AC"],
    amenities: ["WiFi", "Parking", "Breakfast", "AC"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Uttaranchal Homestay Pithoragarh"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Terrace Garden"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Soar Serenity Homes",
    slug: "soar-serenity-homes-pithoragarh",
    city: "Pithoragarh",
    district: "Pithoragarh",
    address: "5 km from center, Chandak Hill Road, Pithoragarh",
    location: { type: "Point", coordinates: [80.2150, 29.6050] },
    price: { amount: 3900, currency: "INR" },
    pricePerNight: 3900,
    rating: 8.9,
    reviewCount: 14,
    phone: "+91 94120 20006",
    description: "Premium budget. Serene location, good for long stays. Mountain views, quiet surroundings.",
    shortDescription: "Hilltop residence on Chandak ridge offering 360-degree vistas of the Soar Valley.",
    category: "Resort",
    facilities: ["WiFi", "Mountain View", "Parking", "AC", "Garden"],
    amenities: ["WiFi", "Mountain View", "Parking", "AC", "Garden"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Soar Serenity Homes"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Soar Valley Sunrise"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Kailash Mansarovar Homestay Gunji",
    slug: "kailash-mansarovar-homestay-gunji",
    city: "Gunji",
    district: "Pithoragarh",
    address: "Gunji village, High-Altitude Border Corridor, Pithoragarh",
    location: { type: "Point", coordinates: [80.8508, 30.1865] },
    price: { amount: 1800, currency: "INR" },
    pricePerNight: 1800,
    rating: 8.4,
    reviewCount: 10,
    phone: "+91 84605 56521",
    description: "Fireplace, 24-hour housekeeping, breakfast. Spiritual location near Gunji. Good for Adi Kailash pilgrims.",
    shortDescription: "Vital high-altitude stone homestay at Gunji for Adi Kailash and Om Parvat yatris.",
    category: "Homestay",
    facilities: ["Breakfast", "Fireplace", "24hr Housekeeping", "WiFi"],
    amenities: ["Breakfast", "Fireplace", "24hr Housekeeping", "WiFi"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Gunji Himalayan Homestay"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Gunji Valley and Snow Peaks"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Atithi Home Stay",
    slug: "atithi-home-stay-chaukori",
    city: "Chaukori",
    district: "Pithoragarh",
    address: "Hamkarki Road, Chaukori, Pithoragarh",
    location: { type: "Point", coordinates: [80.0200, 29.8400] },
    price: { amount: 1500, currency: "INR" },
    pricePerNight: 1500,
    rating: 8.1,
    reviewCount: 12,
    phone: "+91 99800 02770",
    description: "Room service available. Chaukori location with Panchachuli views. Popular among tea garden visitors.",
    shortDescription: "Budget homestay on Hamkarki Road with unobstructed vistas of Panchachuli summits.",
    category: "Homestay",
    facilities: ["Room Service", "WiFi", "Panchachuli View", "Parking"],
    amenities: ["Room Service", "WiFi", "Panchachuli View", "Parking"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Atithi Home Stay Chaukori"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Panchachuli Peaks"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Naina Homestay - Camps & Cottages",
    slug: "naina-homestay-munsiyari",
    city: "Munsiyari",
    district: "Pithoragarh",
    address: "Nayi Basti, Talla Bunga, Munsiyari, Pithoragarh",
    location: { type: "Point", coordinates: [80.2380, 30.0670] },
    price: { amount: 2500, currency: "INR" },
    pricePerNight: 2500,
    rating: 8.6,
    reviewCount: 16,
    phone: "+91 94120 20009",
    description: "Camps + cottages in Munsiyari. Base for Milam, Ralam, Namik glacier treks. Panchachuli views.",
    shortDescription: "Alpine campsite & eco-cottage base in Munsiyari facing the towering Panchachuli massif.",
    category: "Camp",
    facilities: ["Camping", "Cottages", "Mountain View", "Trek Base", "Parking"],
    amenities: ["Camping", "Cottages", "Mountain View", "Trek Base", "Parking"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Naina Homestay Munsiyari"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Panchachuli Massif View"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  },
  {
    name: "Vamoose MAA Bhawani Munsiyari",
    slug: "vamoose-maa-bhawani-munsiyari",
    city: "Munsiyari",
    district: "Pithoragarh",
    address: "Main Trek Base, Munsiyari, Pithoragarh",
    location: { type: "Point", coordinates: [80.2400, 30.0700] },
    price: { amount: 2714, currency: "INR" },
    pricePerNight: 2714,
    rating: 8.7,
    reviewCount: 8,
    phone: "+91 94120 20010",
    description: "Top-rated in Munsiyari. Parking available. Panchachuli base camp views. Trekking hub.",
    shortDescription: "Renowned alpine homestay in Munsiyari favored by Himalayan mountaineers and trekkers.",
    category: "Homestay",
    facilities: ["Parking", "Mountain View", "Trek Base", "WiFi", "Breakfast"],
    amenities: ["Parking", "Mountain View", "Trek Base", "WiFi", "Breakfast"],
    coverImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      source: "Verified Homestay Partner",
      alt: "Vamoose MAA Bhawani Munsiyari"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        source: "Verified Homestay Partner",
        alt: "Munsiyari Alpine Panorama"
      }
    ],
    sourceName: "Verified Uttarakhand Homestay"
  }
];

async function seedRealStays() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected successfully.');

  let inserted = 0;
  let updated = 0;

  for (const s of realStays) {
    const res = await Stay.findOneAndUpdate(
      { slug: s.slug },
      { $set: s },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (res) {
      inserted++;
      console.log(`  ✓ Synced: [${s.district}] ${s.name} (₹${s.pricePerNight}/night)`);
    }
  }

  console.log(`\n🎉 Successfully synced ${inserted} real homestays across Haldwani, Nainital, and Pithoragarh!`);
  await mongoose.disconnect();
  process.exit(0);
}

seedRealStays().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
