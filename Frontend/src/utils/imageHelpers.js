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

export const VEHICLE_RENTAL_IMAGES = [
  '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg', // Himalayan 450
  '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg', // Classic 350
  '/assets/rentals/srinagar-mahindra-thar/cover.jpg', // Thar 4x4
  '/assets/rentals/srinagar-honda-activa-6g/cover.jpg', // Activa 6G
  '/assets/rentals/lansdowne-tvs-jupiter/cover.jpg', // TVS Jupiter
  '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg', // Swift Dzire
  '/assets/rentals/ranikhet-mahindra-scorpio/cover.jpg', // Scorpio Classic
  '/assets/rentals/nainital-toyota-innova-crysta/cover.jpg', // Innova Crysta
  '/assets/rentals/chopta-tvs-apache-rtr-160/cover.jpg', // Apache RTR
  '/assets/rentals/chamoli-hero-xpulse-200/cover.jpg' // XPulse 200
];

export function getRealVehicleAsset(name = '', type = '') {
  const n = (name + ' ' + type).toLowerCase();
  
  // Royal Enfield / Adventure / Cruisers
  if (n.includes('himalayan')) return '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg';
  if (n.includes('classic 350') || n.includes('classic') || n.includes('standard')) return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';
  if (n.includes('bullet')) return '/assets/rentals/tehri-royal-enfield-bullet-350/cover.jpg';
  if (n.includes('meteor')) return '/assets/rentals/rudraprayag-royal-enfield-meteor-350/cover.jpg';
  if (n.includes('interceptor') || n.includes('continental')) return '/assets/rentals/kanatal-royal-enfield-interceptor-650/cover.jpg';
  if (n.includes('thunderbird')) return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';

  // Scooters
  if (n.includes('activa 5g')) return '/assets/rentals/lansdowne-honda-activa-5g/cover.jpg';
  if (n.includes('activa')) return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
  if (n.includes('jupiter')) return '/assets/rentals/lansdowne-tvs-jupiter/cover.jpg';
  if (n.includes('ntorq')) return '/assets/rentals/rishikesh-tvs-ntorq-125/cover.jpg';
  if (n.includes('access')) return '/assets/rentals/ramnagar-suzuki-access-125/cover.jpg';
  if (n.includes('burgman')) return '/assets/rentals/ramnagar-suzuki-burgman-street/cover.jpg';
  if (n.includes('vespa')) return '/assets/rentals/bhimtal-vespa-zx-125/cover.jpg';
  if (n.includes('fascino') || n.includes('ray zr') || n.includes('ray')) return '/assets/rentals/bhimtal-yamaha-fascino/cover.jpg';
  if (n.includes('scooty') || n.includes('scooter') || n.includes('dio')) return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
  
  // Bikes / Trail
  if (n.includes('xpulse') || n.includes('impulse') || n.includes('scram')) return '/assets/rentals/chamoli-hero-xpulse-200/cover.jpg';
  if (n.includes('apache')) return '/assets/rentals/chopta-tvs-apache-rtr-160/cover.jpg';
  if (n.includes('pulsar')) return '/assets/rentals/ramnagar-bajaj-pulsar-150/cover.jpg';
  if (n.includes('duke') || n.includes('ktm') || n.includes('rc 200') || n.includes('rc 390')) return '/assets/rentals/bhimtal-ktm-duke-200/cover.jpg';
  if (n.includes('r15')) return '/assets/rentals/rishikesh-yamaha-r15-v4/cover.jpg';
  if (n.includes('mt-15') || n.includes('fz')) return '/assets/rentals/ramnagar-yamaha-mt-15/cover.jpg';
  if (n.includes('avenger')) return '/assets/rentals/pithoragarh-royal-enfield-classic-350/cover.jpg';
  if (n.includes('splendor')) return '/assets/rentals/kotdwar-hero-splendor-plus/cover.jpg';
  if (n.includes('hf deluxe') || n.includes('deluxe')) return '/assets/rentals/kotdwar-hero-hf-deluxe/cover.jpg';
  if (n.includes('shine')) return '/assets/rentals/kanatal-honda-shine/cover.jpg';

  // SUVs / 4x4 / Big Mountain Cars
  if (n.includes('thar') || n.includes('gurkha')) return '/assets/rentals/srinagar-mahindra-thar/cover.jpg';
  if (n.includes('scorpio')) return '/assets/rentals/ranikhet-mahindra-scorpio/cover.jpg';
  if (n.includes('xuv') || n.includes('xuv700') || n.includes('xuv300')) return '/assets/rentals/tehri-mahindra-xuv700/cover.jpg';
  if (n.includes('xylo')) return '/assets/rentals/bhimtal-mahindra-xylo/cover.jpg';
  if (n.includes('marazzo')) return '/assets/rentals/chopta-mahindra-marazzo/cover.jpg';
  if (n.includes('bolero')) return '/assets/rentals/mukteshwar-mahindra-bolero-camper/cover.jpg';
  if (n.includes('innova')) return '/assets/rentals/nainital-toyota-innova-crysta/cover.jpg';
  if (n.includes('fortuner')) return '/assets/rentals/haridwar-toyota-fortuner/cover.jpg';
  if (n.includes('etios')) return '/assets/rentals/tehri-toyota-etios/cover.jpg';
  if (n.includes('creta') || n.includes('venue')) return '/assets/rentals/rudraprayag-hyundai-creta/cover.jpg';
  if (n.includes('seltos')) return '/assets/rentals/dhanaulti-kia-seltos/cover.jpg';
  if (n.includes('nexon')) return '/assets/rentals/mussoorie-tata-nexon/cover.jpg';
  if (n.includes('harrier')) return '/assets/rentals/rishikesh-tata-harrier/cover.jpg';
  if (n.includes('safari')) return '/assets/rentals/tehri-tata-safari/cover.jpg';
  if (n.includes('hector')) return '/assets/rentals/mukteshwar-mg-hector/cover.jpg';
  if (n.includes('duster')) return '/assets/rentals/chamoli-renault-duster/cover.jpg';
  if (n.includes('traveller') || n.includes('tempo')) return '/assets/rentals/bhimtal-tempo-traveller-12-seater/cover.jpg';

  // Hatchback & Sedans
  if (n.includes('dzire') || n.includes('swift dzire')) return '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg';
  if (n.includes('swift')) return '/assets/rentals/srinagar-maruti-suzuki-swift/cover.jpg';
  if (n.includes('i20')) return '/assets/rentals/joshimath-hyundai-i20/cover.jpg';
  if (n.includes('baleno')) return '/assets/rentals/pithoragarh-maruti-suzuki-baleno/cover.jpg';
  if (n.includes('city') || n.includes('honda city')) return '/assets/rentals/rudraprayag-honda-city/cover.jpg';
  if (n.includes('celerio')) return '/assets/rentals/tehri-maruti-suzuki-celerio/cover.jpg';
  if (n.includes('wagonr') || n.includes('wagon r')) return '/assets/rentals/tehri-maruti-wagonr/cover.jpg';
  if (n.includes('alto')) return '/assets/rentals/ranikhet-maruti-alto-800/cover.jpg';
  if (n.includes('ertiga')) return '/assets/rentals/ranikhet-maruti-suzuki-ertiga/cover.jpg';
  if (n.includes('ciaz')) return '/assets/rentals/rudraprayag-honda-city/cover.jpg';

  // Category fallback
  if (n.includes('bike') || n.includes('motorcycle')) return '/assets/rentals/dhanaulti-royal-enfield-himalayan/cover.jpg';
  if (n.includes('suv') || n.includes('4x4')) return '/assets/rentals/srinagar-mahindra-thar/cover.jpg';
  if (n.includes('sedan') || n.includes('car') || n.includes('hatchback')) return '/assets/rentals/haldwani-maruti-suzuki-dzire/cover.jpg';

  return '/assets/rentals/srinagar-honda-activa-6g/cover.jpg';
}

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

  const isVehicle = item.category?.toLowerCase()?.includes('rental') || 
                    item.category?.toLowerCase()?.includes('bike') || 
                    item.category?.toLowerCase()?.includes('car') || 
                    item.category?.toLowerCase()?.includes('scooter') || 
                    item.type?.toLowerCase()?.includes('bike') || 
                    item.type?.toLowerCase()?.includes('scooter') || 
                    item.type?.toLowerCase()?.includes('car') || 
                    item.type?.toLowerCase()?.includes('motorcycle') || 
                    item.type?.toLowerCase()?.includes('suv') || 
                    item.type?.toLowerCase()?.includes('sedan') || 
                    item.vehicleType || 
                    item.businessName || 
                    item.pricePerDay || 
                    (Array.isArray(item.vehicles) && item.vehicles.length > 0);

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
      if (url.includes('.svg') || url.includes('interior.png')) {
        if (isVehicle) {
          url = getRealVehicleAsset(item.name || item.title, item.type || item.category);
        } else {
          return;
        }
      }

      // If vehicle image is an Unsplash generic stock photo, substitute with authentic local vehicle asset
      if (isVehicle && url.includes('unsplash.com')) {
        url = getRealVehicleAsset(item.name || item.title, item.type || item.category);
      }

      // Filter out purged 404 Wikimedia URLs (such as Bhatta fall)
      if (url.includes('Bhatta_fall_mussoorie.jpg') || url.includes('Gunji') || url.includes('Lake_Mist')) {
        return;
      }

      if (!images.includes(url)) {
        images.push(url);
      }
    }
  };

  // For individual vehicle items, prioritize vehicle's specific image over parent fleet cover
  if (isVehicle && (item.businessName || item.type || item.typeDetail)) {
    if (item.image) addUrl(item.image);
    if (item.coverImage && item.coverImage !== item.image) addUrl(item.coverImage);
  } else {
    if (item.coverImage) addUrl(item.coverImage);
    if (item.image) addUrl(item.image);
  }
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
    const isStay = item.category?.toLowerCase()?.includes('stay') || 
                   item.category?.toLowerCase()?.includes('homestay') || 
                   item.category?.toLowerCase()?.includes('camp') || 
                   item.type === 'stay' || 
                   item.pricePerNight;

    if (isVehicle) {
      return [getRealVehicleAsset(item.name || item.title || item.type, item.type || item.category)];
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
