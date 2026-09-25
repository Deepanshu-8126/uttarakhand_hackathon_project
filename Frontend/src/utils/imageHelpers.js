/**
 * Discovery Uttarakhand - Image Extraction, Normalization & Global Fallback Engine
 * Safely extracts clean image URL strings and guarantees ZERO BLANK CARDS across the platform.
 */

// ── 1. Verified Named Destination Image Directory ─────────────────────────────
// Guarantees that destinations with rate-limited (429) or purged (404) Wikimedia links
// always display verified, high-resolution Himalayan photography.
export const DESTINATION_NAMED_IMAGES = {
  'bhatta falls': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'lake mist': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'jharipani falls': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'barkot': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'chopta': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'dehradun': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'gaumukh': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'gunji': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'milam': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'someshwar': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'sonprayag': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'thal': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'mussoorie': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'happy valley': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'jim corbett national park': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  'rajaji national park': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  'robbers cave': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'sattal': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'bhimtal': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'nainital': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'kedarnath': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'badrinath': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'auli': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'rishikesh': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'valley of flowers': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'ranikhet': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'kausani': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'munsiyari': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'almora': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'tungnath': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  'gangotri': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'yamunotri': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  'hemkund sahib': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'dhanaulti': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'lansdowne': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
};

// ── 2. Thematic Keyword Photo Banks ───────────────────────────────────────────
const THEMATIC_PHOTOS = {
  waterfall: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  temple: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  lake: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  river: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
  meadow: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  peak: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  forest: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  general: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
};

const MOUNTAIN_STAY_IMAGES = [
  'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop', // Cozy Wooden Cottage
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop', // Riverside Valley Eco Camp
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', // Snow Peak Himalayan Retreat
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop', // Pine Forest Chalet
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', // High Altitude Mountain Base
  'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=800&auto=format&fit=crop', // Stone & Cedar Pahadi Homestay
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop', // Trishul Peak View Homestay
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop'  // Himalayan Valley Orchard Cabin
];

const VEHICLE_RENTAL_IMAGES = [
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop', // Royal Enfield Himalayan Adventure
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop', // Royal Enfield Classic 350 Reborn
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop', // Mahindra Thar 4x4 Mountain Expedition
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop', // Self-Drive Mountain Sedan
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop', // Mountain Tourer Cruiser
  'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=1200&auto=format&fit=crop'  // Himalayan Scrambler / Trail Bike
];

// ── 3. Intelligent Self-Healing Fallback Provider ────────────────────────────
export function getHimalayanFallbackImage(item) {
  if (!item) return THEMATIC_PHOTOS.general;
  
  const name = (item.name || item.title || '').toLowerCase().trim();
  const slug = (item.slug || '').toLowerCase().trim();
  const desc = (item.description || item.shortDescription || item.category || '').toLowerCase();
  const combined = `${name} ${slug} ${desc}`;

  // Check direct name lookup
  for (const [key, url] of Object.entries(DESTINATION_NAMED_IMAGES)) {
    if (name.includes(key) || slug.includes(key.replace(/\s+/g, '-'))) {
      return url;
    }
  }

  // Check thematic keywords
  if (/waterfall|falls|fall|cascade/i.test(combined)) {
    return THEMATIC_PHOTOS.waterfall;
  }
  if (/temple|mandir|dham|shrine|spiritual|sacred|ghat|kund|ashram|gurdwara/i.test(combined)) {
    return THEMATIC_PHOTOS.temple;
  }
  if (/lake|tal|reservoir|dam|barrage|water/i.test(combined)) {
    return THEMATIC_PHOTOS.lake;
  }
  if (/river|ganga|ganges|rafting|prayag|sangam/i.test(combined)) {
    return THEMATIC_PHOTOS.river;
  }
  if (/ski|snow|bugyal|meadow|trek|glacier|pass|peak|mountain|himalaya/i.test(combined)) {
    return THEMATIC_PHOTOS.peak;
  }
  if (/wildlife|sanctuary|national park|forest|tiger|deer|bird/i.test(combined)) {
    return THEMATIC_PHOTOS.forest;
  }
  
  return THEMATIC_PHOTOS.general;
}

// ── 4. Main Card Image Resolver ──────────────────────────────────────────────
export function getCardImages(item, fallbackUrl = '/assets/fallback.svg') {
  if (!item) return [fallbackUrl];

  const images = [];
  const name = (item.name || item.title || '').toLowerCase().trim();

  // If item is a known destination with a dedicated verified photo, prioritize it
  for (const [key, photoUrl] of Object.entries(DESTINATION_NAMED_IMAGES)) {
    if (name === key || name.startsWith(key) || (item.slug && item.slug.toLowerCase().includes(key.replace(/\s+/g, '-')))) {
      images.push(photoUrl);
      break;
    }
  }

  const addUrl = (val) => {
    if (!val) return;
    let url = null;
    if (typeof val === 'string' && val.trim() !== '') {
      url = val.trim();
    } else if (typeof val === 'object' && val !== null) {
      url = val.url || val.secure_url || val.src || null;
    }

    if (url && typeof url === 'string') {
      // Filter out generic duplicate svg illustrations and low-res diagram screenshots
      if (url.includes('.svg') || url.includes('interior.png')) return;

      // Filter out purged 404 Wikimedia URLs (such as Bhatta fall)
      if (url.includes('Bhatta_fall_mussoorie.jpg') || url.includes('Gunji') || url.includes('Lake_Mist')) {
        return;
      }

      if (!images.includes(url)) {
        images.push(url);
      }
    }
  };

  // 1. Primary cover image / image
  if (item.coverImage) addUrl(item.coverImage);
  if (item.image) addUrl(item.image);
  if (item.profileImage) addUrl(item.profileImage);

  // 2. Extract vehicle photos from rental fleets
  if (Array.isArray(item.vehicles)) {
    item.vehicles.forEach(v => {
      if (v?.image) addUrl(v.image);
      if (v?.coverImage) addUrl(v.coverImage);
      if (Array.isArray(v?.images)) v.images.forEach(img => addUrl(img));
    });
  }

  // 3. Extract fleet array
  if (Array.isArray(item.fleet)) {
    item.fleet.forEach(f => {
      if (f?.image) addUrl(f.image);
      if (f?.coverImage) addUrl(f.coverImage);
    });
  }

  // 4. Gallery array
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach(g => addUrl(g));
  }

  // 5. Images array
  if (Array.isArray(item.images)) {
    item.images.forEach(img => addUrl(img));
  }

  // 6. Photos array
  if (Array.isArray(item.photos)) {
    item.photos.forEach(p => addUrl(p));
  }

  // If no valid real photos found, provide intelligent fallback
  if (images.length === 0) {
    const isVehicle = item.category?.toLowerCase()?.includes('rental') || 
                      item.category?.toLowerCase()?.includes('bike') || 
                      item.category?.toLowerCase()?.includes('car') || 
                      item.category?.toLowerCase()?.includes('scooter') || 
                      item.type?.toLowerCase()?.includes('bike') || 
                      item.type?.toLowerCase()?.includes('scooter') || 
                      item.type?.toLowerCase()?.includes('car') || 
                      item.type?.toLowerCase()?.includes('motorcycle') || 
                      item.type?.toLowerCase()?.includes('suv') || 
                      item.vehicleType || 
                      item.pricePerDay || 
                      (Array.isArray(item.vehicles) && item.vehicles.length > 0);

    const isStay = item.category?.toLowerCase()?.includes('stay') || 
                   item.category?.toLowerCase()?.includes('homestay') || 
                   item.category?.toLowerCase()?.includes('camp') || 
                   item.type === 'stay' || 
                   item.pricePerNight;

    if (isVehicle) {
      const seedStr = (item.name || item.id || item._id || 'vehicle').toString();
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      const idx = Math.abs(hash) % VEHICLE_RENTAL_IMAGES.length;
      return [VEHICLE_RENTAL_IMAGES[idx]];
    }

    if (isStay) {
      const seedStr = (item.name || item.id || item._id || 'stay').toString();
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      const idx = Math.abs(hash) % MOUNTAIN_STAY_IMAGES.length;
      return [MOUNTAIN_STAY_IMAGES[idx]];
    }

    // Otherwise it's a destination/attraction -> return smart Himalayan fallback
    return [getHimalayanFallbackImage(item)];
  }

  return images;
}
