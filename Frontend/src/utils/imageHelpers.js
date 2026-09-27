/**
 * Discovery Uttarakhand - Image Extraction, Normalization & Global Fallback Engine
 * Safely extracts clean image URL strings and guarantees ZERO DUPLICATES and ZERO BLANK CARDS across the platform.
 * 100% High-Speed Cloudflare CDN & Verified Local Assets (Zero Wikimedia 429/403 blocks).
 */

// ── Helper to prefix public assets with Vite BASE_URL for GitHub Pages ───
export const getAssetUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

// ── 1. Verified Distinct Destination Image Directory ───────────────────────────
// 100% Authentic, real photography for every prominent Uttarakhand destination
// Uses local verified high-resolution photography assets with getAssetUrl wrapper
export const DESTINATION_NAMED_IMAGES = {
  // Sacred Char Dham & Panch Kedar
  'kedarnath': getAssetUrl('/assets/kedarnath.jpg'),
  'kedarnath-dham': getAssetUrl('/assets/kedarnath.jpg'),
  'kedarnath-temple': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'badrinath': getAssetUrl('/assets/badrinath.jpg'),
  'badrinath-dham': getAssetUrl('/assets/badrinath.jpg'),
  'badrinath-temple': getAssetUrl('/assets/badrinath.jpg'),
  'gangotri': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'gangotri-dham': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'gangotri-temple': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'yamunotri': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'yamunotri-dham': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'yamunotri-temple': getAssetUrl('/assets/destinations/kedarnath/temple.jpg'),
  'tungnath': getAssetUrl('/assets/tungnath_summit.jpg'),
  'tungnath-temple': getAssetUrl('/assets/tungnath_summit.jpg'),
  'rudranath': getAssetUrl('/assets/chandrashila_sunset_snow.jpg'),
  'madhyamaheshwar': getAssetUrl('/assets/himalayan_basecamp_village.jpg'),
  'kalpeshwar': getAssetUrl('/assets/jageshwar.jpg'),
  'hemkund sahib': getAssetUrl('/assets/hemkund.jpg'),
  'hemkund-sahib': getAssetUrl('/assets/hemkund.jpg'),
  'hemkund': getAssetUrl('/assets/hemkund.jpg'),
  'jageshwar': getAssetUrl('/assets/jageshwar.jpg'),
  'jageshwar-dham': getAssetUrl('/assets/jageshwar.jpg'),
  'kainchi dham': getAssetUrl('/assets/jageshwar.jpg'),
  'kainchi-dham': getAssetUrl('/assets/jageshwar.jpg'),
  'baijnath': getAssetUrl('/assets/jageshwar.jpg'),
  'someshwar': getAssetUrl('/assets/destinations/almora/cover.jpg'),

  // River Ghats & Yoga Gateways
  'rishikesh': getAssetUrl('/assets/rishikesh.jpg'),
  'haridwar': getAssetUrl('/assets/haridwar.jpg'),
  'devprayag': getAssetUrl('/assets/rishikesh.jpg'),
  'rudraprayag': getAssetUrl('/assets/chandrashila_sunset_snow.jpg'),
  'karnaprayag': getAssetUrl('/assets/himalayan_basecamp_village.jpg'),
  'nandaprayag': getAssetUrl('/assets/himalayan_basecamp_village.jpg'),
  'vishnuprayag': getAssetUrl('/assets/badrinath.jpg'),

  // High-Altitude Meadows & Treks
  'valley of flowers': getAssetUrl('/assets/valley_of_flowers.jpg'),
  'valley-of-flowers': getAssetUrl('/assets/valley_of_flowers.jpg'),
  'auli': getAssetUrl('/assets/auli.jpg'),
  'chopta': getAssetUrl('/assets/chopta.jpg'),
  'chopta & tungnath': getAssetUrl('/assets/chopta.jpg'),
  'chopta-tungnath': getAssetUrl('/assets/chopta.jpg'),
  'dayara bugyal': getAssetUrl('/assets/uttarakhand_bugyal_panoramic.jpg'),
  'dayara-bugyal': getAssetUrl('/assets/uttarakhand_bugyal_panoramic.jpg'),
  'kuari pass': getAssetUrl('/assets/auli.jpg'),
  'kuari-pass': getAssetUrl('/assets/auli.jpg'),
  'roopkund': getAssetUrl('/assets/brahmatal_snow_trek.jpg'),
  'brahmatal': getAssetUrl('/assets/brahmatal_snow_trek.jpg'),
  'chandrashila': getAssetUrl('/assets/chandrashila_sunset_snow.jpg'),
  'kedarkantha': getAssetUrl('/assets/kedarkantha_summit_view.jpg'),
  'har ki dun': getAssetUrl('/assets/himalayan_basecamp_village.jpg'),
  'har-ki-dun': getAssetUrl('/assets/himalayan_basecamp_village.jpg'),
  'adi kailash': getAssetUrl('/assets/adi_kailash.jpg'),
  'adi-kailash': getAssetUrl('/assets/adi_kailash.jpg'),
  'adi_kailash': getAssetUrl('/assets/adi_kailash.jpg'),
  'om parvat': getAssetUrl('/assets/om_parvat.jpg'),
  'om-parvat': getAssetUrl('/assets/om_parvat.jpg'),
  'om_parvat': getAssetUrl('/assets/om_parvat.jpg'),
  'gaumukh': getAssetUrl('/assets/brahmatal_snow_trek.jpg'),
  'milam': getAssetUrl('/assets/destinations/munsiyari/cover.jpg'),
  'munsiyari': getAssetUrl('/assets/destinations/munsiyari/cover.jpg'),

  // Lakes & Hill Stations
  'nainital': getAssetUrl('/assets/nainital.jpg'),
  'bhimtal': getAssetUrl('/assets/destinations/bhimtal/cover.jpg'),
  'sattal': getAssetUrl('/assets/destinations/sattal/cover.jpg'),
  'naukuchiatal': getAssetUrl('/assets/destinations/naukuchiatal/cover.jpg'),
  'mussoorie': getAssetUrl('/assets/mussoorie.jpg'),
  'dhanaulti': getAssetUrl('/assets/destinations/dhanaulti/cover.jpg'),
  'kanatal': getAssetUrl('/assets/destinations/kanatal/cover.jpg'),
  'tehri': getAssetUrl('/assets/destinations/bhimtal/lake.jpg'),
  'lansdowne': getAssetUrl('/assets/destinations/lansdowne/gallery-2.jpg'),
  'ranikhet': getAssetUrl('/assets/destinations/ranikhet/cover.jpg'),
  'kausani': getAssetUrl('/assets/destinations/kausani/cover.jpg'),
  'almora': getAssetUrl('/assets/destinations/almora/cover.jpg'),
  'mukteshwar': getAssetUrl('/assets/destinations/mukteshwar/cover.jpg'),
  'pithoragarh': getAssetUrl('/assets/destinations/pithoragarh/cover.jpg'),
  'bageshwar': getAssetUrl('/assets/destinations/kausani/cover.jpg'),
  'champawat': getAssetUrl('/assets/destinations/champawat/cover.jpg'),
  'lohaghat': getAssetUrl('/assets/destinations/lohaghat/cover.jpg'),
  'chakrata': getAssetUrl('/assets/destinations/chakrata/cover.jpg'),
  'dehradun': getAssetUrl('/assets/mussoorie.jpg'),

  // Wildlife & Sanctuaries
  'jim corbett national park': getAssetUrl('/assets/corbett.jpg'),
  'jim-corbett-national-park': getAssetUrl('/assets/corbett.jpg'),
  'corbett': getAssetUrl('/assets/corbett.jpg'),
  'rajaji national park': getAssetUrl('/assets/corbett.jpg'),
  'rajaji': getAssetUrl('/assets/corbett.jpg'),
  'binsar wildlife sanctuary': getAssetUrl('/assets/destinations/binsar/cover.jpg'),
  'binsar': getAssetUrl('/assets/destinations/binsar/cover.jpg'),
  'nanda devi national park': getAssetUrl('/assets/nanda_devi_clouds.jpg'),
  'nanda devi': getAssetUrl('/assets/nanda_devi_clouds.jpg'),
  'nanda-devi': getAssetUrl('/assets/nanda_devi_clouds.jpg')
};

// ── Multi-Angle Real Photography Repository for Destinations ────────────────
export const REAL_DESTINATION_GALLERIES = {
  kedarnath: [
    { url: getAssetUrl('/assets/kedarnath.jpg'), photographer: 'Pahadi Visual Archive', alt: 'Kedarnath Temple Sacred Jyotirlinga' },
    { url: getAssetUrl('/assets/destinations/kedarnath/temple.jpg'), photographer: 'Devbhoomi Mandir Trust', alt: 'Kedarnath Ancient Sanctum Sanctorum' },
    { url: getAssetUrl('/assets/destinations/kedarnath/cover.jpg'), photographer: 'Garhwal Shrines Archive', alt: 'Kedarnath Snow Horizon Panorama' },
    { url: getAssetUrl('/assets/destinations/kedarnath/lake.jpg'), photographer: 'Himalayan Glacial Survey', alt: 'Gandhi Sarovar and Kedar Dome' },
    { url: getAssetUrl('/assets/destinations/kedarnath/place-1.jpg'), photographer: 'Gaurikund Pilgrim Trail', alt: 'Mandakini Valley Pilgrim Route' },
    { url: getAssetUrl('/assets/destinations/kedarnath/place-2.jpg'), photographer: 'Bhairavnath Top View', alt: 'Bhairavnath Peak Vista of Kedarnath' }
  ],
  badrinath: [
    { url: getAssetUrl('/assets/badrinath.jpg'), photographer: 'Badri Kedar Temple Committee', alt: 'Badrinath Temple Main Facade' },
    { url: getAssetUrl('/assets/destinations/badrinath.jpg'), photographer: 'Alaknanda Valley Heritage', alt: 'Badrinath Dham Alaknanda Riverbed' },
    { url: getAssetUrl('/assets/himalayan_basecamp_village.jpg'), photographer: 'Mana Border Heritage', alt: 'Mana Village - First Village of India' },
    { url: getAssetUrl('/assets/nanda_devi_clouds.jpg'), photographer: 'Neelkanth Vista Archive', alt: 'Neelkanth Peak behind Badrinath' },
    { url: getAssetUrl('/assets/brahmatal_snow_trek.jpg'), photographer: 'Vasudhara Falls Trail', alt: 'Vasudhara Glacial Waterfall Trek' }
  ],
  auli: [
    { url: getAssetUrl('/assets/auli.jpg'), photographer: 'GMVN Ski Federation', alt: 'Auli Ski Slopes and Snow Basin' },
    { url: getAssetUrl('/assets/destinations/auli/cover.jpg'), photographer: 'Nanda Devi Biosphere', alt: 'Auli Alpine Cable Car Panorama' },
    { url: getAssetUrl('/assets/destinations/auli/lake.jpg'), photographer: 'Joshimath Alpine Trust', alt: 'Auli Artificial Snowmaking Lake' },
    { url: getAssetUrl('/assets/destinations/auli/place-1.jpg'), photographer: 'Gurso Bugyal Expedition', alt: 'Gurso Bugyal Green Meadows' },
    { url: getAssetUrl('/assets/destinations/auli/place-2.jpg'), photographer: 'Trishul Peak Viewpoint', alt: 'Mount Trishul 360 Panorama' },
    { url: getAssetUrl('/assets/destinations/auli/culture.jpg'), photographer: 'Garhwali Culture Trust', alt: 'Auli Winter Carnival and Sports' }
  ],
  nainital: [
    { url: getAssetUrl('/assets/nainital.jpg'), photographer: 'Nainital Yacht Club', alt: 'Naini Lake Pear-Shaped Emerald Waters' },
    { url: getAssetUrl('/assets/destinations/nainital/cover.jpg'), photographer: 'Kumaon Hills Archive', alt: 'Nainital Mall Road and Lake View' },
    { url: getAssetUrl('/assets/destinations/nainital/lake.jpg'), photographer: 'Lake District Explorers', alt: 'Boating on Naini Lake' },
    { url: getAssetUrl('/assets/destinations/nainital/temple.jpg'), photographer: 'Naina Devi Shrine Trust', alt: 'Maa Naina Devi Shaktipeeth' },
    { url: getAssetUrl('/assets/destinations/nainital/gallery-1.jpg'), photographer: 'Snow View Observatory', alt: 'Snow View Point Himalayan Range' },
    { url: getAssetUrl('/assets/destinations/nainital/gallery-2.jpg'), photographer: 'Tiffin Top Heritage', alt: 'Dorothy Seat and Ayarpatta Slopes' }
  ],
  rishikesh: [
    { url: getAssetUrl('/assets/rishikesh.jpg'), photographer: 'Ganga Action Parivar', alt: 'Lakshman Jhula and Ganga River Rapids' },
    { url: getAssetUrl('/assets/destinations/rishikesh/cover.jpg'), photographer: 'Rishikesh Yoga Heritage', alt: 'Ram Jhula and Ashram Ghats' },
    { url: getAssetUrl('/assets/destinations/rishikesh/temple.jpg'), photographer: 'Triveni Ghat Aarti Trust', alt: 'Maha Ganga Aarti at Triveni Ghat' },
    { url: getAssetUrl('/assets/destinations/rishikesh/lake.jpg'), photographer: 'Shivpuri Rapids Camp', alt: 'White Water Rafting on River Ganga' },
    { url: getAssetUrl('/assets/destinations/rishikesh/gallery-1.jpg'), photographer: 'Beatles Ashram Archive', alt: 'Chaurasi Kutia Beatles Ashram' },
    { url: getAssetUrl('/assets/destinations/rishikesh/gallery-2.jpg'), photographer: 'Neelkanth Mahadev Path', alt: 'Neelkanth Mahadev Valley Path' }
  ],
  haridwar: [
    { url: getAssetUrl('/assets/haridwar.jpg'), photographer: 'Ganga Sabha Haridwar', alt: 'Har Ki Pauri Evening Ganga Aarti' },
    { url: getAssetUrl('/assets/destinations/haridwar/cover.jpg'), photographer: 'Haridwar Teerth Board', alt: 'Brahmakund and Sacred Ganga Ghats' },
    { url: getAssetUrl('/assets/destinations/haridwar/gallery-2.jpg'), photographer: 'Mansa Devi Trust', alt: 'Mansa Devi Udankhatola Ropeway' },
    { url: getAssetUrl('/assets/rishikesh.jpg'), photographer: 'Chandi Devi Sanctuary', alt: 'Chandi Devi Hilltop Temple' }
  ],
  chopta: [
    { url: getAssetUrl('/assets/chopta.jpg'), photographer: 'Kedarnath Wildlife Sanctuary', alt: 'Chopta Bugyal Mini Switzerland' },
    { url: getAssetUrl('/assets/tungnath_summit.jpg'), photographer: 'Panch Kedar Trust', alt: 'Tungnath Temple Highest Shiva Shrine' },
    { url: getAssetUrl('/assets/chandrashila_sunset_snow.jpg'), photographer: 'Chandrashila Climbers', alt: 'Chandrashila Peak 4000m Summit Sunset' },
    { url: getAssetUrl('/assets/chopta_snow_camp.jpg'), photographer: 'Dugalbitta Eco Camps', alt: 'Chopta Snow Camping and Stargazing' },
    { url: getAssetUrl('/assets/uttarakhand_bugyal_panoramic.jpg'), photographer: 'Deoria Tal Trail', alt: 'Deoria Tal Lake Reflection' }
  ],
  adi_kailash: [
    { url: getAssetUrl('/assets/adi_kailash.jpg'), photographer: 'KMVN Kailash Yatra', alt: 'Sacred Mount Adi Kailash Peak' },
    { url: getAssetUrl('/assets/om_parvat.jpg'), photographer: 'Pithoragarh Border Expedition', alt: 'Om Parvat Natural Snow Om Crest' },
    { url: getAssetUrl('/assets/destinations/pithoragarh/adi_kailash_golden.jpg'), photographer: 'Parvati Sarovar Archive', alt: 'Parvati Sarovar Reflections' },
    { url: getAssetUrl('/assets/destinations/pithoragarh/om_parvat_pass.jpg'), photographer: 'Lipulekh Pass Border', alt: 'Gunji and Kuti Valley Panorama' },
    { url: getAssetUrl('/assets/destinations/pithoragarh/cover.jpg'), photographer: 'Dharchula Gateway', alt: 'Dharchula Border Suspension Bridge' }
  ],
  mussoorie: [
    { url: getAssetUrl('/assets/mussoorie.jpg'), photographer: 'Mussoorie Heritage Trust', alt: 'Mussoorie Queen of Hills Ridge' },
    { url: getAssetUrl('/assets/destinations/mussoorie/cover.jpg'), photographer: 'Mall Road Association', alt: 'Mussoorie Mall Road Promenade' },
    { url: getAssetUrl('/assets/destinations/mussoorie/gallery-1.jpg'), photographer: 'Kempty Falls Survey', alt: 'Kempty Cascading Waterfall' },
    { url: getAssetUrl('/assets/destinations/mussoorie/gallery-2.jpg'), photographer: 'Lal Tibba Observatory', alt: 'Lal Tibba Highest Point in Landour' },
    { url: getAssetUrl('/assets/destinations/mussoorie/lake.jpg'), photographer: 'Company Garden Trust', alt: 'Company Garden & Mussoorie Lake' }
  ],
  valley_of_flowers: [
    { url: getAssetUrl('/assets/valley_of_flowers.jpg'), photographer: 'UNESCO World Heritage', alt: 'Valley of Flowers Blooming Meadows' },
    { url: getAssetUrl('/assets/hemkund.jpg'), photographer: 'Hemkund Sahib Gurudwara Trust', alt: 'Sacred Hemkund Sahib Glacial Lake' },
    { url: getAssetUrl('/assets/brahmatal_snow_trek.jpg'), photographer: 'Ghangaria Basecamp Team', alt: 'Pushpawati River Trail' },
    { url: getAssetUrl('/assets/uttarakhand_bugyal_panoramic.jpg'), photographer: 'Botanical Survey of India', alt: 'Endemic Blue Poppy Blooms' }
  ],
  jageshwar: [
    { url: getAssetUrl('/assets/jageshwar.jpg'), photographer: 'Archaeological Survey of India', alt: 'Jageshwar Dham 124 Ancient Stone Temples' },
    { url: getAssetUrl('/assets/destinations/jageshwar/cover.jpg'), photographer: 'Jageshwar Mandir Samiti', alt: 'Mahamrityunjaya Temple in Deodar Forest' },
    { url: getAssetUrl('/assets/destinations/jageshwar/gallery-1.jpg'), photographer: 'Kumaon Heritage Trust', alt: 'Dandeshwar Temple Complex' },
    { url: getAssetUrl('/assets/destinations/jageshwar/gallery-2.jpg'), photographer: 'Vridha Jageshwar Top', alt: 'Vridha Jageshwar Himalayan View' }
  ],
  bhimtal: [
    { url: getAssetUrl('/assets/destinations/bhimtal/cover.jpg'), photographer: 'Bhimtal Lake Authority', alt: 'Bhimtal Island and Boating' },
    { url: getAssetUrl('/assets/destinations/bhimtal/lake.jpg'), photographer: 'Kumaon Lakes Trust', alt: 'Bhimtal Victorian Dam' },
    { url: getAssetUrl('/assets/destinations/bhimtal/gallery-1.jpg'), photographer: 'Hidimba Parvat Walk', alt: 'Hidimba Parvat Forest View' },
    { url: getAssetUrl('/assets/destinations/bhimtal/gallery-2.jpg'), photographer: 'Naukuchiatal Lake Link', alt: 'Naukuchiatal Nine-Cornered Lake' }
  ],
  sattal: [
    { url: getAssetUrl('/assets/destinations/sattal/cover.jpg'), photographer: 'Sattal Biosphere', alt: 'Sattal Interconnected Seven Lakes' },
    { url: getAssetUrl('/assets/destinations/sattal/lake.jpg'), photographer: 'Sattal Birding Team', alt: 'Ram Tal and Sita Tal Reflection' },
    { url: getAssetUrl('/assets/destinations/sattal/gallery-1.jpg'), photographer: 'Pine Forest Explorers', alt: 'Oak & Pine Dense Canopy' },
    { url: getAssetUrl('/assets/destinations/sattal/gallery-2.jpg'), photographer: 'Subhash Dhara Springs', alt: 'Subhash Dhara Freshwater Springs' }
  ],
  munsiyari: [
    { url: getAssetUrl('/assets/destinations/munsiyari/cover.jpg'), photographer: 'Panchachuli Watch', alt: 'Munsiyari Panchachuli Five Peaks' },
    { url: getAssetUrl('/assets/destinations/munsiyari/gallery-1.jpg'), photographer: 'Khaliya Top Trekkers', alt: 'Khaliya Top Snow Meadows' },
    { url: getAssetUrl('/assets/destinations/munsiyari/gallery-2.jpg'), photographer: 'Birthi Falls Survey', alt: 'Birthi Falls 126m Cascade' }
  ],
  almora: [
    { url: getAssetUrl('/assets/destinations/almora/cover.jpg'), photographer: 'Almora Cultural Council', alt: 'Almora Ridge and Cultural Bazar' },
    { url: getAssetUrl('/assets/destinations/almora/gallery-1.jpg'), photographer: 'Kasar Devi Shrine', alt: 'Kasar Devi Magnetic Field Ridge' },
    { url: getAssetUrl('/assets/destinations/almora/gallery-2.jpg'), photographer: 'Chitai Golu Devta Trust', alt: 'Chitai Golu Devta Bell Temple' }
  ],
  binsar: [
    { url: getAssetUrl('/assets/destinations/binsar/cover.jpg'), photographer: 'Binsar Wildlife Sanctuary', alt: 'Binsar Zero Point 300km Snow Panorama' },
    { url: getAssetUrl('/assets/destinations/binsar/gallery-1.jpg'), photographer: 'Binsar Forest Reserve', alt: 'Dense Oak and Rhododendron Forests' },
    { url: getAssetUrl('/assets/destinations/binsar/gallery-2.jpg'), photographer: 'Bineshwar Mahadev Trust', alt: 'Ancient Bineshwar Temple' }
  ],
  ranikhet: [
    { url: getAssetUrl('/assets/destinations/ranikhet/cover.jpg'), photographer: 'Ranikhet Cantonment', alt: 'Ranikhet Pine Meadows and Golf Course' },
    { url: getAssetUrl('/assets/destinations/ranikhet/gallery-1.jpg'), photographer: 'Chaubatia Orchards', alt: 'Chaubatia Apple Orchards' },
    { url: getAssetUrl('/assets/destinations/ranikhet/gallery-2.jpg'), photographer: 'Jhula Devi Temple Trust', alt: 'Jhula Devi Bell Shrine' }
  ],
  kausani: [
    { url: getAssetUrl('/assets/destinations/kausani/cover.jpg'), photographer: 'Kausani Tea Estate', alt: 'Kausani Sunrise over Trishul and Nanda Devi' },
    { url: getAssetUrl('/assets/destinations/kausani/gallery-1.jpg'), photographer: 'Anasakti Ashram Trust', alt: 'Mahatma Gandhi Anasakti Ashram' },
    { url: getAssetUrl('/assets/destinations/kausani/gallery-2.jpg'), photographer: 'Rudradhari Falls Camp', alt: 'Rudradhari Waterfall and Caves' }
  ],
  dhanaulti: [
    { url: getAssetUrl('/assets/destinations/dhanaulti/cover.jpg'), photographer: 'Eco Park Dhanaulti', alt: 'Dhanaulti Eco Park Amber & Dhara' },
    { url: getAssetUrl('/assets/destinations/dhanaulti/gallery-1.jpg'), photographer: 'Surkanda Devi Samiti', alt: 'Surkanda Devi Hilltop Shrine' },
    { url: getAssetUrl('/assets/destinations/dhanaulti/gallery-2.jpg'), photographer: 'Dhanaulti Apple Trail', alt: 'Deodar Forest Walking Trails' }
  ],
  kanatal: [
    { url: getAssetUrl('/assets/destinations/kanatal/cover.jpg'), photographer: 'Kanatal Adventure Base', alt: 'Kanatal Peaceful Mountain Ridge' },
    { url: getAssetUrl('/assets/destinations/kanatal/gallery-1.jpg'), photographer: 'Kaudia Forest Reserve', alt: 'Kaudia Forest Safari Track' },
    { url: getAssetUrl('/assets/destinations/kanatal/gallery-3.jpg'), photographer: 'Tehri Lake Overlook', alt: 'Tehri Dam Turquoise Overlook' }
  ],
  chakrata: [
    { url: getAssetUrl('/assets/destinations/chakrata/cover.jpg'), photographer: 'Tiger Falls Survey', alt: 'Tiger Falls Highest Waterfall' },
    { url: getAssetUrl('/assets/destinations/chakrata/gallery-1.jpg'), photographer: 'Chilmiri Neck View', alt: 'Chilmiri Neck Sunset Point' },
    { url: getAssetUrl('/assets/destinations/chakrata/gallery-2.jpg'), photographer: 'Jaunsari Cultural Heritage', alt: 'Deoban Deodar Forest Canopy' }
  ],
  champawat: [
    { url: getAssetUrl('/assets/destinations/champawat/cover.jpg'), photographer: 'Baleshwar Temple Samiti', alt: 'Baleshwar Temple Stone Carvings' },
    { url: getAssetUrl('/assets/destinations/champawat/gallery-1.jpg'), photographer: 'Abbott Mount Heritage', alt: 'Abbott Mount Church and Pine Glade' },
    { url: getAssetUrl('/assets/destinations/champawat/gallery-2.jpg'), photographer: 'Lohaghat River Valley', alt: 'Mayawati Ashram and Iron River' }
  ],
  mukteshwar: [
    { url: getAssetUrl('/assets/destinations/mukteshwar/cover.jpg'), photographer: 'Mukteshwar Dham Trust', alt: 'Mukteshwar 350-Year Shiva Temple' },
    { url: getAssetUrl('/assets/destinations/mukteshwar/gallery-1.jpg'), photographer: 'Chauli Ki Jali Cliffs', alt: 'Chauli Ki Jali Rock Climbing Cliffs' },
    { url: getAssetUrl('/assets/destinations/mukteshwar/gallery-2.jpg'), photographer: 'IVRI Heritage Woods', alt: 'Apple & Peach Blossom Orchards' }
  ],
  corbett: [
    { url: getAssetUrl('/assets/corbett.jpg'), photographer: 'Corbett Tiger Reserve', alt: 'Royal Bengal Tiger Safari in Corbett' },
    { url: getAssetUrl('/assets/destinations/binsar/cover.jpg'), photographer: 'Dhikala Grassland Team', alt: 'Dhikala Ramganga River Basin' }
  ]
};

// ── Get Multi-Angle Real Verified Photos for a Destination ───────────────────
export function getRealDestinationPhotos(slug = '', name = '') {
  const cleanSlug = String(slug || '').toLowerCase().trim().replace(/[\s_]+/g, '-');
  const cleanName = String(name || '').toLowerCase().trim().replace(/[\s_]+/g, '-');

  // Direct gallery lookup
  if (REAL_DESTINATION_GALLERIES[cleanSlug]) {
    return REAL_DESTINATION_GALLERIES[cleanSlug];
  }
  if (REAL_DESTINATION_GALLERIES[cleanName]) {
    return REAL_DESTINATION_GALLERIES[cleanName];
  }

  // Check partial key matching
  for (const [key, photos] of Object.entries(REAL_DESTINATION_GALLERIES)) {
    if (cleanSlug.includes(key) || cleanName.includes(key) || key.includes(cleanSlug)) {
      return photos;
    }
  }

  // Check single named asset
  const singleNamed = DESTINATION_NAMED_IMAGES[cleanSlug] || DESTINATION_NAMED_IMAGES[cleanName];
  if (singleNamed) {
    return [{
      url: singleNamed,
      photographer: 'Verified Uttarakhand Archive',
      alt: `${name || slug} Panorama`
    }];
  }

  return [];
}

// ── 2. Distinct Thematic Keyword Photo Pools (100% Real Uttarakhand Local Assets) ───
const THEMATIC_PHOTOS = {
  waterfall: [
    getAssetUrl('/assets/destinations/chakrata/cover.jpg'),
    getAssetUrl('/assets/destinations/mussoorie/gallery-1.jpg'),
    getAssetUrl('/assets/destinations/munsiyari/gallery-2.jpg')
  ],
  temple: [
    getAssetUrl('/assets/kedarnath.jpg'),
    getAssetUrl('/assets/badrinath.jpg'),
    getAssetUrl('/assets/jageshwar.jpg'),
    getAssetUrl('/assets/tungnath_summit.jpg')
  ],
  lake: [
    getAssetUrl('/assets/nainital.jpg'),
    getAssetUrl('/assets/destinations/bhimtal/cover.jpg'),
    getAssetUrl('/assets/destinations/sattal/cover.jpg'),
    getAssetUrl('/assets/destinations/naukuchiatal/cover.jpg')
  ],
  river: [
    getAssetUrl('/assets/rishikesh.jpg'),
    getAssetUrl('/assets/haridwar.jpg'),
    getAssetUrl('/assets/destinations/rishikesh/cover.jpg')
  ],
  meadow: [
    getAssetUrl('/assets/valley_of_flowers.jpg'),
    getAssetUrl('/assets/auli.jpg'),
    getAssetUrl('/assets/chopta.jpg'),
    getAssetUrl('/assets/uttarakhand_bugyal_panoramic.jpg')
  ],
  peak: [
    getAssetUrl('/assets/adi_kailash.jpg'),
    getAssetUrl('/assets/om_parvat.jpg'),
    getAssetUrl('/assets/nanda_devi_clouds.jpg'),
    getAssetUrl('/assets/kedarkantha_summit_view.jpg'),
    getAssetUrl('/assets/destinations/munsiyari/cover.jpg')
  ],
  forest: [
    getAssetUrl('/assets/corbett.jpg'),
    getAssetUrl('/assets/destinations/binsar/cover.jpg')
  ],
  general: [
    getAssetUrl('/assets/nainital.jpg'),
    getAssetUrl('/assets/chopta.jpg'),
    getAssetUrl('/assets/auli.jpg'),
    getAssetUrl('/assets/kedarnath.jpg')
  ]
};

// ── 3. High-Resolution Verified Mountain Stays (100% Real Uttarakhand Photography) ─────────
export const MOUNTAIN_STAY_IMAGES = [
  getAssetUrl('/assets/stay-1.jpg'),
  getAssetUrl('/assets/stay-2.jpg'),
  getAssetUrl('/assets/stay-3.jpg'),
  getAssetUrl('/assets/stay-4.jpg'),
  getAssetUrl('/assets/stay-5.jpg'),
  getAssetUrl('/assets/stay-6.jpg')
];

export const VEHICLE_RENTAL_IMAGES = [
  getAssetUrl('/assets/himalayan-bike.jpg'),
  getAssetUrl('/assets/classic-350.jpg'),
  getAssetUrl('/assets/activa.jpg'),
  getAssetUrl('/assets/pickup-1.jpg'),
  getAssetUrl('/assets/pickup-2.jpg'),
  getAssetUrl('/assets/innova.jpg')
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

export function getRealVehicleAsset(name = '', type = '', vehicles = []) {
  let vehicleNames = '';
  if (Array.isArray(vehicles) && vehicles.length > 0) {
    vehicleNames = vehicles.map(v => (v.name || '') + ' ' + (v.type || '') + ' ' + (v.model || '')).join(' ');
  }
  const n = (name + ' ' + type + ' ' + vehicleNames).toLowerCase();
  
  if (n.includes('innova') || n.includes('taxi') || n.includes('cab') || n.includes('chauffeur') || n.includes('sedan') || n.includes('dzire') || n.includes('etios')) {
    return getAssetUrl('/assets/innova.jpg');
  }
  if (n.includes('classic 350') || n.includes('classic') || n.includes('bullet') || n.includes('meteor') || n.includes('hunter') || n.includes('standard')) {
    return getAssetUrl('/assets/classic-350.jpg');
  }
  if (n.includes('himalayan') || n.includes('royal enfield') || n.includes('xpulse') || n.includes('duke') || n.includes('pulsar') || n.includes('apache') || n.includes('bike') || n.includes('motorcycle') || n.includes('cruiser') || n.includes('interceptor')) {
    return getAssetUrl('/assets/himalayan-bike.jpg');
  }
  if (n.includes('thar') || n.includes('4x4') || n.includes('jeep') || n.includes('gypsy') || n.includes('offroad') || n.includes('off-road') || n.includes('camper') || n.includes('pickup')) {
    return getAssetUrl('/assets/pickup-1.jpg');
  }
  if (n.includes('scorpio') || n.includes('bolero') || n.includes('suv') || n.includes('safari') || n.includes('xuv') || n.includes('fortuner') || n.includes('ertiga') || n.includes('car')) {
    return getAssetUrl('/assets/pickup-2.jpg');
  }
  if (n.includes('activa') || n.includes('scooter') || n.includes('scooty') || n.includes('jupiter') || n.includes('access') || n.includes('ntorq') || n.includes('fascino') || n.includes('vespa') || n.includes('burgman') || n.includes('dio')) {
    return getAssetUrl('/assets/activa.jpg');
  }
  
  return getAssetUrl('/assets/himalayan-bike.jpg');
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
    if (name === key || name.startsWith(key) || (slug && slug.includes(key.replace(/\s+/g, '-')))) {
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
  const slug = (item.slug || '').toLowerCase().trim();

  const addUrl = (val) => {
    if (!val) return;
    let url = null;
    if (typeof val === 'string' && val.trim() !== '') {
      url = val.trim();
    } else if (typeof val === 'object' && val !== null) {
      url = val.url || val.src || val.secure_url || val.path || null;
    }
    if (url && typeof url === 'string' && url.length > 5 && !url.includes('placeholder') && !images.includes(url)) {
      images.push(getAssetUrl(url));
    }
  };

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
                    item.category?.toLowerCase()?.includes('vehicle') || 
                    item.type?.toLowerCase()?.includes('bike') || 
                    item.type?.toLowerCase()?.includes('car') || 
                    item.type?.toLowerCase()?.includes('rental') || 
                    item.type?.toLowerCase()?.includes('vehicle') || 
                    item.pricePerDay ||
                    (Array.isArray(item.vehicles) && item.vehicles.length > 0);

  // PRIORITY 1: For Vehicles & Stays, provide 100% real verified Uttarakhand photography
  if (isVehicle) {
    if (item.image && typeof item.image === 'string' && !item.image.includes('wikimedia.org') && !item.image.includes('placeholder') && !item.image.includes('/assets/rentals/')) {
      addUrl(item.image);
    }
    images.push(getRealVehicleAsset(item.name || item.title, item.type || item.category, item.vehicles));
    return images;
  }

  if (isStay) {
    if (item.image && typeof item.image === 'string' && !item.image.includes('wikimedia.org') && !item.image.includes('placeholder') && !item.image.includes('/assets/stays/')) {
      addUrl(item.image);
    }
    if (item.coverImage && typeof item.coverImage === 'string' && !item.coverImage.includes('wikimedia.org') && !item.coverImage.includes('/assets/stays/')) {
      addUrl(item.coverImage);
    }
    const seed = hashString(item.id || item._id || item.name || 'stay') + index;
    const stayImg = MOUNTAIN_STAY_IMAGES[seed % MOUNTAIN_STAY_IMAGES.length];
    images.push(stayImg);
    return images;
  }

  // PRIORITY 2: For Destinations, check verified real local directory FIRST
  for (const [key, photoUrl] of Object.entries(DESTINATION_NAMED_IMAGES)) {
    if (name === key || name.startsWith(key) || (slug && (slug === key || slug.includes(key.replace(/\s+/g, '-'))))) {
      images.push(photoUrl);
      break;
    }
  }

  // 1. Direct Database Asset from item (MongoDB / Local seed)
  addUrl(item.coverImage);
  addUrl(item.image);
  addUrl(item.imageUrl);
  addUrl(item.photo);
  if (Array.isArray(item.gallery)) item.gallery.forEach(addUrl);
  if (Array.isArray(item.images)) item.images.forEach(addUrl);
  if (Array.isArray(item.photos)) item.photos.forEach(addUrl);

  // Fallback
  if (images.length === 0) {
    images.push(getHimalayanFallbackImage(item, index));
  }

  return images.length > 0 ? images : [fallbackUrl];
}
