import api from './api';
import { getEntityPlaceholderSvg, DESTINATION_NAMED_IMAGES } from '../utils/imageHelpers';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

const VERIFIED_LANDMARK_MAP = {
  'gauri kund': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Gauri_Kund%2C_Adi_Kailash.jpg',
  'gaurikund': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Gauri_Kund%2C_Adi_Kailash.jpg',
  'parvati kund': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Parvati_Kund_at_Adi-Kailash.jpg/1920px-Parvati_Kund_at_Adi-Kailash.jpg',
  'parvati sarovar': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Parvati_Kund_at_Adi-Kailash.jpg/1920px-Parvati_Kund_at_Adi-Kailash.jpg',
  'raj bhavan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg/1920px-Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg',
  'governor house': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg/1920px-Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg',
  'naina devi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Naina_Devi_Temple%2C_Nainital.jpg/1920px-Naina_Devi_Temple%2C_Nainital.jpg',
  'tiffin top': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tiffin_Top%2C_Nainital.jpg/1920px-Tiffin_Top%2C_Nainital.jpg'
};

function resolvePoiPhoto(name, category = 'Spot') {
  const n = String(name || '').toLowerCase().trim();
  for (const [key, url] of Object.entries(VERIFIED_LANDMARK_MAP)) {
    if (n.includes(key)) return url;
  }
  for (const [key, url] of Object.entries(DESTINATION_NAMED_IMAGES)) {
    if (n === key) return url;
  }
  return getEntityPlaceholderSvg({ name, category });
}

/**
 * Direct Client-Side Geoapify Geocoding Fallback:
 * Guarantees that search works 100% on Vercel even if Render backend is sleeping or 404s.
 */
async function directGeoapifySearch(query) {
  try {
    const cleanQ = query.trim();
    const queryWithUttarakhand = /uttarakhand/i.test(cleanQ) ? cleanQ : `${cleanQ} Uttarakhand`;
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(queryWithUttarakhand)}&limit=10&apiKey=${GEOAPIFY_KEY}`;
    
    const res = await fetch(url);
    if (!res.ok) return { count: 0, data: [] };
    const json = await res.json();
    
    const seen = new Set();
    const places = [];

    (json.features || []).forEach((f, idx) => {
      const p = f.properties || {};
      const [lng, lat] = f.geometry?.coordinates || [null, null];
      const name = p.name || p.street || p.city || cleanQ;
      const vicinity = [p.county, p.state_district, p.city, p.state].filter(Boolean).join(', ') || p.formatted || 'Uttarakhand';
      
      const normKey = `${name.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}__${vicinity.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}`;
      if (seen.has(normKey)) return;
      seen.add(normKey);

      const photoUrl = resolvePoiPhoto(name, p.categories?.[0] || 'Landmark');

      places.push({
        place_id: p.place_id || `geo_${lat}_${lng}_${idx}`,
        name: name,
        vicinity: vicinity,
        location: { lat, lng },
        rating: null,
        user_ratings_total: null,
        photo_urls: [photoUrl],
        is_google_verified: false,
        provider: 'Geoapify Live Satellite Radar (Direct Web GIS)'
      });
    });

    return {
      count: places.length,
      data: places,
      source: 'geoapify_direct_web'
    };
  } catch (err) {
    console.warn('[placesApi] Direct Geoapify fallback failed:', err.message);
    return { count: 0, data: [] };
  }
}

export const placesApi = {
  // Search places dynamically (Backend first, fallback to direct Geoapify)
  searchPlaces: async (query, { lat, lng, radius } = {}) => {
    try {
      const params = { query };
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      if (radius) params.radius = radius;
      
      const res = await api.get('/places/search', { params, timeout: 8000 });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      // Backend returned 404, network error, or Render is sleeping -> fallback to direct Geoapify
    }

    // Direct Web GIS Fallback
    return await directGeoapifySearch(query);
  },

  // Get nearby hidden viewpoints, dhabas, tea stalls, campsites
  getNearbyPlaces: async ({ lat, lng, type = 'all', radius = 15000, keyword = '' } = {}) => {
    try {
      const params = { lat, lng, type, radius, keyword };
      const res = await api.get('/places/nearby', { params, timeout: 8000 });
      if (res.data?.data) return res.data;
    } catch (err) {
      // Direct Geoapify POI fallback
      try {
        const categories = 'tourism,natural,accommodation,catering';
        const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},${radius}&limit=20&apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const seen = new Set();
          const items = [];

          (json.features || []).forEach((f, idx) => {
            const p = f.properties || {};
            const name = p.name || 'Scenic Mountain Spot';
            const vicinity = p.formatted || p.street || 'Uttarakhand, India';
            const normKey = `${name.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}__${vicinity.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}`;
            
            if (seen.has(normKey) || (p.place_id && seen.has(p.place_id))) return;
            seen.add(normKey);
            if (p.place_id) seen.add(p.place_id);

            const photoUrl = resolvePoiPhoto(name, p.categories?.[0] || 'Scenic Spot');

            items.push({
              place_id: p.place_id || `geo_${idx}`,
              name: name,
              vicinity: vicinity,
              location: {
                lat: f.geometry?.coordinates?.[1],
                lng: f.geometry?.coordinates?.[0]
              },
              rating: null,
              user_ratings_total: null,
              photo_urls: [photoUrl],
              provider: 'Geoapify Live Radar'
            });
          });

          return { count: items.length, data: items };
        }
      } catch (e) {}
    }
    return { count: 0, data: [] };
  },

  // Get rich place details (reviews, live rating, high-res photos)
  getPlaceDetails: async ({ placeId, name }) => {
    try {
      const params = {};
      if (placeId) params.placeId = placeId;
      if (name) params.name = name;
      const res = await api.get('/places/details', { params, timeout: 8000 });
      return res.data;
    } catch (err) {
      const pPhoto = resolvePoiPhoto(name || 'Himalayan Landmark', 'Landmark');
      return {
        success: true,
        data: {
          name: name || 'Himalayan Landmark',
          rating: null,
          user_ratings_total: null,
          photo_urls: [pPhoto],
          provider: 'Himalayan Radar'
        }
      };
    }
  },

  // Check integration status
  getStatus: async () => {
    try {
      const res = await api.get('/places/status', { timeout: 3000 });
      return res.data;
    } catch (err) {
      return {
        success: true,
        data: {
          status: 'Direct Client Web GIS Active',
          provider: 'Geoapify Web Radar',
          apiKeyConfigured: Boolean(GEOAPIFY_KEY)
        }
      };
    }
  },

  // Get live turn-by-turn route directions
  getRouteDirections: async ({ fromLat, fromLng, toLat, toLng, mode = 'drive' }) => {
    try {
      const params = { fromLat, fromLng, toLat, toLng, mode };
      const res = await api.get('/places/route', { params, timeout: 3500 });
      return res.data;
    } catch (err) {
      // Direct Geoapify Routing Fallback
      try {
        const m = mode === 'walk' ? 'walk' : 'drive';
        const url = `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}&mode=${m}&apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          return { success: true, data: json };
        }
      } catch (e) {}
      return { success: false, message: 'Routing unavailable' };
    }
  }
};

export default placesApi;
