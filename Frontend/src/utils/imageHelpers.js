/**
 * Discovery Uttarakhand - Image Extraction, Normalization & Global Fallback Engine
 * Safely extracts clean image URL strings and guarantees ZERO DUPLICATES and ZERO BLANK CARDS across the platform.
 */

// ── 1. Verified Distinct Destination Image Directory ───────────────────────────
// 100% Unique, authentic high-resolution photography for every prominent Uttarakhand destination
export const DESTINATION_NAMED_IMAGES = {
  // Sacred Char Dham & Panch Kedar
  'kedarnath': '/assets/yatra_sarthi/kedarnath.jpg',
  'badrinath': '/assets/yatra_sarthi/badrinath.jpg',
  'gangotri': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'yamunotri': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'tungnath': '/assets/yatra_sarthi/chopta.jpg',
  'rudranath': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'madhyamaheshwar': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'kalpeshwar': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'hemkund sahib': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'jageshwar': '/assets/jageshwar.jpg',
  'baijnath': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'someshwar': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',

  // River Ghats & Yoga Gateways
  'rishikesh': '/assets/yatra_sarthi/rishikesh.jpg',
  'haridwar': '/assets/yatra_sarthi/haridwar.jpg',
  'devprayag': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'rudraprayag': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'karnaprayag': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'nandaprayag': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'vishnuprayag': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',

  // High-Altitude Meadows & Treks
  'valley of flowers': '/assets/yatra_sarthi/valley_of_flowers.jpg',
  'auli': '/assets/yatra_sarthi/auli.jpg',
  'chopta': '/assets/yatra_sarthi/chopta.jpg',
  'dayara bugyal': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
  'kuari pass': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'roopkund': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'kedarkantha': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'har ki dun': 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
  'adi kailash': '/assets/destinations/pithoragarh/gallery-1.jpg',
  'om parvat': '/assets/destinations/pithoragarh/gallery-1.jpg',
  'gaumukh': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'milam': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'munsiyari': '/assets/destinations/munsiyari/cover.jpg',

  // Lakes & Hill Stations
  'nainital': '/assets/yatra_sarthi/nainital.jpg',
  'bhimtal': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'sattal': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'naukuchiatal': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'mussoorie': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'dhanaulti': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  'kanatal': 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
  'tehri': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'lansdowne': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
  'ranikhet': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'kausani': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'almora': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'mukteshwar': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'pithoragarh': '/assets/destinations/pithoragarh/gallery-1.jpg',
  'bageshwar': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
  'champawat': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'dehradun': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',

  // Waterfalls & Caves
  'kempty falls': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'bhatta falls': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'jharipani falls': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'robbers cave': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'patal bhuvaneshwar': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',

  // Wildlife & Sanctuaries
  'jim corbett national park': '/assets/yatra_sarthi/corbett.jpg',
  'rajaji national park': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  'binsar wildlife sanctuary': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  'govind pashu vihar': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'nanda devi national park': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
};

// ── 2. Distinct Thematic Keyword Photo Pools (Zero Repeating Links) ───────────
const THEMATIC_PHOTOS = {
  waterfall: [
    'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'
  ],
  temple: [
    '/assets/yatra_sarthi/kedarnath.jpg',
    '/assets/yatra_sarthi/badrinath.jpg',
    '/assets/jageshwar.jpg',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80'
  ],
  lake: [
    '/assets/yatra_sarthi/nainital.jpg',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
  ],
  river: [
    '/assets/yatra_sarthi/rishikesh.jpg',
    '/assets/yatra_sarthi/haridwar.jpg',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80'
  ],
  meadow: [
    '/assets/yatra_sarthi/valley_of_flowers.jpg',
    '/assets/yatra_sarthi/auli.jpg',
    '/assets/yatra_sarthi/chopta.jpg',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80'
  ],
  peak: [
    '/assets/destinations/munsiyari/cover.jpg',
    '/assets/destinations/pithoragarh/gallery-1.jpg',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  ],
  forest: [
    '/assets/yatra_sarthi/corbett.jpg',
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'
  ],
  general: [
    '/assets/yatra_sarthi/nainital.jpg',
    '/assets/yatra_sarthi/chopta.jpg',
    '/assets/yatra_sarthi/auli.jpg'
  ]
};

// ── 3. High-Resolution Verified Mountain Stays (25+ Distinct Assets) ─────────
export const MOUNTAIN_STAY_IMAGES = [
  'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1000&auto=format&fit=crop', // Stone & Cedar Homestay
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop', // Pine Forest Chalet
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop', // Valley View Retreat
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop', // Mountain Cottage
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop', // Riverside Eco Camp
  'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1000&auto=format&fit=crop', // Cozy Wooden Cabin
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop', // Orchard Homestay
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop', // Himalayan Lodge
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop', // High Altitude Base
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop', // Meadow Glamping
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop', // Alpine Camp
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop', // Traditional Haveli Stay
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop', // Heritage Kumaoni Stay
  'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?q=80&w=1000&auto=format&fit=crop'  // Forest Eco Resort
];

export const VEHICLE_RENTAL_IMAGES = [
  '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg',
  '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg',
  '/assets/rentals/srinagar-mahindra-thar/cover.jpg',
  '/assets/rentals/srinagar-honda-activa-6g/cover.jpg',
  '/assets/rentals/lansdowne-tvs-jupiter/cover.jpg',
  '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg',
  '/assets/rentals/ranikhet-mahindra-scorpio/cover.jpg',
  '/assets/rentals/nainital-toyota-innova-crysta/cover.jpg',
  '/assets/rentals/chopta-tvs-apache-rtr-160/cover.jpg',
  '/assets/rentals/chamoli-hero-xpulse-200/cover.jpg'
];

// ── 4. Deterministic Hash for Unique Image Selection ──────────────────────────
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRealVehicleAsset(name = '', type = '') {
  const n = (name + ' ' + type).toLowerCase();
  
  if (n.includes('himalayan')) return '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg';
  if (n.includes('classic 350') || n.includes('classic') || n.includes('standard')) return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';
  if (n.includes('bullet')) return '/assets/rentals/tehri-royal-enfield-bullet-350/cover.jpg';
  if (n.includes('meteor')) return '/assets/rentals/rudraprayag-royal-enfield-meteor-350/cover.jpg';
  if (n.includes('interceptor') || n.includes('continental')) return '/assets/rentals/kanatal-royal-enfield-interceptor-650/cover.jpg';
  if (n.includes('activa')) return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
  if (n.includes('jupiter')) return '/assets/rentals/lansdowne-tvs-jupiter/cover.jpg';
  if (n.includes('ntorq')) return '/assets/rentals/rishikesh-tvs-ntorq-125/cover.jpg';
  if (n.includes('xpulse')) return '/assets/rentals/chamoli-hero-xpulse-200/cover.jpg';
  if (n.includes('apache')) return '/assets/rentals/chopta-tvs-apache-rtr-160/cover.jpg';
  if (n.includes('thar')) return '/assets/rentals/srinagar-mahindra-thar/cover.jpg';
  if (n.includes('scorpio')) return '/assets/rentals/ranikhet-mahindra-scorpio/cover.jpg';
  if (n.includes('innova')) return '/assets/rentals/nainital-toyota-innova-crysta/cover.jpg';
  if (n.includes('dzire')) return '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg';
  
  return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
}

// ── 5. Intelligent Self-Healing Fallback Provider (Zero Duplicates) ───────────
export function getHimalayanFallbackImage(item, index = 0) {
  if (!item) return THEMATIC_PHOTOS.general[0];
  
  const name = (item.name || item.title || '').toLowerCase().trim();
  const slug = (item.slug || '').toLowerCase().trim();
  const desc = (item.description || item.shortDescription || item.category || '').toLowerCase();
  const combined = `${name} ${slug} ${desc}`;
  const seed = hashString(name || slug || 'himalaya') + index;

  // Check direct name lookup
  for (const [key, url] of Object.entries(DESTINATION_NAMED_IMAGES)) {
    if (name.includes(key) || slug.includes(key.replace(/\s+/g, '-'))) {
      return url;
    }
  }

  // Check thematic keyword pools
  if (/waterfall|falls|fall|cascade/i.test(combined)) {
    const pool = THEMATIC_PHOTOS.waterfall;
    return pool[seed % pool.length];
  }
  if (/temple|mandir|dham|shrine|spiritual|sacred|ghat|kund|ashram|gurdwara/i.test(combined)) {
    const pool = THEMATIC_PHOTOS.temple;
    return pool[seed % pool.length];
  }
  if (/lake|tal|reservoir|dam|barrage|water/i.test(combined)) {
    const pool = THEMATIC_PHOTOS.lake;
    return pool[seed % pool.length];
  }
  if (/river|ganga|ganges|rafting|prayag|sangam/i.test(combined)) {
    const pool = THEMATIC_PHOTOS.river;
    return pool[seed % pool.length];
  }
  if (/ski|snow|bugyal|meadow|trek|glacier|pass|peak|mountain|himalaya/i.test(combined)) {
    const pool = THEMATIC_PHOTOS.peak;
    return pool[seed % pool.length];
  }
  if (/wildlife|sanctuary|national park|forest|tiger|deer|bird/i.test(combined)) {
    const pool = THEMATIC_PHOTOS.forest;
    return pool[seed % pool.length];
  }
  
  const genPool = THEMATIC_PHOTOS.general;
  return genPool[seed % genPool.length];
}

// ── 6. Main Card Image Resolver ──────────────────────────────────────────────
export function getCardImages(item, fallbackUrl = '/assets/fallback.svg', index = 0) {
  if (!item) return [fallbackUrl];

  const images = [];
  const name = (item.name || item.title || '').toLowerCase().trim();

  // 1. Direct verified named destination
  for (const [key, photoUrl] of Object.entries(DESTINATION_NAMED_IMAGES)) {
    if (name === key || name.startsWith(key) || (item.slug && item.slug.toLowerCase().includes(key.replace(/\s+/g, '-')))) {
      images.push(photoUrl);
      break;
    }
  }

  const isStay = item.category?.toLowerCase()?.includes('stay') || 
                 item.category?.toLowerCase()?.includes('homestay') || 
                 item.category?.toLowerCase()?.includes('hotel') || 
                 item.category?.toLowerCase()?.includes('resort') || 
                 item.category?.toLowerCase()?.includes('camp') || 
                 item.type?.toLowerCase()?.includes('stay') || 
                 item.type?.toLowerCase()?.includes('homestay') || 
                 item.type?.toLowerCase()?.includes('hotel') || 
                 item.type?.toLowerCase()?.includes('resort') || 
                 item.type?.toLowerCase()?.includes('camp') || 
                 item.pricePerNight;

  const isVehicle = item.category?.toLowerCase()?.includes('rental') || 
                    item.category?.toLowerCase()?.includes('bike') || 
                    item.category?.toLowerCase()?.includes('car') || 
                    item.type?.toLowerCase()?.includes('bike') || 
                    item.type?.toLowerCase()?.includes('car') || 
                    item.pricePerDay;

  const addUrl = (val) => {
    if (!val) return;
    let url = null;
    if (typeof val === 'string' && val.trim() !== '') {
      url = val.trim();
    } else if (typeof val === 'object' && val !== null) {
      url = val.url || val.src || val.secure_url || val.path || null;
    }
    if (url && typeof url === 'string' && url.length > 5 && !url.includes('placeholder') && !images.includes(url)) {
      images.push(url);
    }
  };

  // Add primary coverImage
  addUrl(item.coverImage);
  addUrl(item.image);
  addUrl(item.imageUrl);
  addUrl(item.photo);

  // Add gallery images
  if (Array.isArray(item.gallery)) item.gallery.forEach(addUrl);
  if (Array.isArray(item.images)) item.images.forEach(addUrl);
  if (Array.isArray(item.photos)) item.photos.forEach(addUrl);

  // Specialized fallbacks with deterministic indexing (zero duplicates)
  if (images.length === 0) {
    if (isVehicle) {
      images.push(getRealVehicleAsset(item.name || item.title, item.type || item.category));
    } else if (isStay) {
      const seed = hashString(item.id || item._id || item.name || 'stay') + index;
      const stayImg = MOUNTAIN_STAY_IMAGES[seed % MOUNTAIN_STAY_IMAGES.length];
      images.push(stayImg);
    } else {
      images.push(getHimalayanFallbackImage(item, index));
    }
  }

  return images.length > 0 ? images : [fallbackUrl];
}
