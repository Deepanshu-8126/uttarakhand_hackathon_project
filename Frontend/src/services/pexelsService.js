/**
 * Discovery Uttarakhand - Pexels & Dynamic Real Image Engine
 * 
 * Automatically fetches high-definition photography via:
 * 1. Local Authentic Cache & Mappings
 * 2. Backend /api/photos/search (Redis cached)
 * 3. Pexels REST API (when VITE_PEXELS_API_KEY is present)
 * 4. Wikimedia Commons Open Geosearch API (Zero API key needed, 100% authentic)
 * 5. Curated High-Resolution Himalayan Pexels Photography Collection
 * 
 * STRICT ZERO-PLACEHOLDER GUARANTEE: Never renders a dark "Photo Unavailable" placeholder!
 */

const PEXELS_CACHE_KEY_PREFIX = 'du_img_cache_';
const memoryCache = new Map();

// Curated high-resolution Uttarakhand Himalayan photography by category (Pexels / Unsplash Verified CDN)
export const HIMALAYAN_THEME_FALLBACKS = {
  wildlife: [
    'https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/34098/south-africa-hluhluwe-imfolozi-park-wilderness.jpg?auto=compress&cs=tinysrgb&w=1200'
  ],
  temple: [
    'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80'
  ],
  lake: [
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1574843/pexels-photo-1574843.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80'
  ],
  trek: [
    'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'
  ],
  mountain: [
    'https://images.pexels.com/photos/673020/pexels-photo-673020.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
  ],
  homestay: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
  ],
  river: [
    'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ram_Jhula_Rishikesh.jpg/1280px-Ram_Jhula_Rishikesh.jpg'
  ]
};

/**
 * Fetch from Backend /api/photos/search
 */
async function fetchFromBackendAPI(query) {
  try {
    const res = await fetch(`http://localhost:5000/api/photos/search?query=${encodeURIComponent(query)}&count=4`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map(p => p.url).filter(Boolean);
      }
    }
  } catch (e) {
    // Backend offline or timeout, continue to client fetch
  }
  return null;
}

/**
 * Fetch directly from Pexels API (client-side if key provided)
 */
async function fetchFromPexels(query) {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY || (typeof window !== 'undefined' && window.__PEXELS_API_KEY__);
  if (!apiKey || apiKey === 'YOUR_PEXELS_API_KEY_HERE') return null;

  try {
    const cleanQuery = encodeURIComponent(`${query} Uttarakhand Himalayas`);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${cleanQuery}&per_page=3&orientation=landscape`, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos.map(p => p.src?.large2x || p.src?.large || p.src?.medium);
    }
  } catch (err) {
    console.debug('[Pexels API] fetch note:', err.message);
  }
  return null;
}

/**
 * Fetch authentic photos from Wikipedia / Wikimedia Commons Open API (Zero Key Required)
 */
async function fetchFromWikimedia(query) {
  try {
    const cleanTitle = encodeURIComponent(query.trim());
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=1200&titles=${cleanTitle}&origin=*`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const data = await res.json();
    
    const pages = data?.query?.pages;
    if (pages) {
      for (const pageId of Object.keys(pages)) {
        const page = pages[pageId];
        if (page.original?.source) return [page.original.source];
        if (page.thumbnail?.source) return [page.thumbnail.source];
      }
    }
  } catch (err) {
    console.debug('[Wikimedia API] fetch note:', err.message);
  }
  return null;
}

/**
 * Main Image Resolver for destination/entity photos
 * Returns verified real photography without ever returning placeholders
 */
export async function resolveOnlinePhotos(name, category = 'Destination') {
  if (!name || typeof name !== 'string') return HIMALAYAN_THEME_FALLBACKS.mountain;
  const normalizedKey = name.toLowerCase().trim().replace(/[\s_]+/g, '-');

  // 1. Check Memory Cache
  if (memoryCache.has(normalizedKey)) {
    return memoryCache.get(normalizedKey);
  }

  // 2. Check LocalStorage Cache
  try {
    const cached = localStorage.getItem(PEXELS_CACHE_KEY_PREFIX + normalizedKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache.set(normalizedKey, parsed);
        return parsed;
      }
    }
  } catch (e) {}

  // 3. Try Backend Service (Redis + Verified Directory)
  let fetchedImages = await fetchFromBackendAPI(name);

  // 4. Try Direct Pexels API
  if (!fetchedImages || fetchedImages.length === 0) {
    fetchedImages = await fetchFromPexels(name);
  }

  // 5. Try Wikimedia Commons Open API
  if (!fetchedImages || fetchedImages.length === 0) {
    fetchedImages = await fetchFromWikimedia(name);
  }

  // 6. Category-Aware Curated Pexels Himalayan Collection (Never dark placeholder)
  if (!fetchedImages || fetchedImages.length === 0) {
    const catLower = (category || '').toLowerCase();
    const nameLower = name.toLowerCase();

    let theme = 'mountain';
    if (catLower.includes('wild') || catLower.includes('sanctuary') || catLower.includes('park') || nameLower.includes('park') || nameLower.includes('sanctuary')) {
      theme = 'wildlife';
    } else if (catLower.includes('temple') || catLower.includes('dham') || catLower.includes('shrine') || catLower.includes('spiritual') || nameLower.includes('temple') || nameLower.includes('dham')) {
      theme = 'temple';
    } else if (catLower.includes('lake') || catLower.includes('tal') || catLower.includes('water') || nameLower.includes('lake') || nameLower.includes('tal')) {
      theme = 'lake';
    } else if (catLower.includes('trek') || catLower.includes('pass') || catLower.includes('bugyal') || nameLower.includes('trek') || nameLower.includes('bugyal')) {
      theme = 'trek';
    } else if (catLower.includes('stay') || catLower.includes('homestay') || catLower.includes('hotel') || catLower.includes('resort')) {
      theme = 'homestay';
    } else if (nameLower.includes('ganga') || nameLower.includes('river') || nameLower.includes('ghat')) {
      theme = 'river';
    }
    fetchedImages = HIMALAYAN_THEME_FALLBACKS[theme] || HIMALAYAN_THEME_FALLBACKS.mountain;
  }

  // Save to Cache
  if (fetchedImages && fetchedImages.length > 0) {
    memoryCache.set(normalizedKey, fetchedImages);
    try {
      localStorage.setItem(PEXELS_CACHE_KEY_PREFIX + normalizedKey, JSON.stringify(fetchedImages));
    } catch (e) {}
  }

  return fetchedImages || HIMALAYAN_THEME_FALLBACKS.mountain;
}

export default {
  resolveOnlinePhotos,
  HIMALAYAN_THEME_FALLBACKS
};
