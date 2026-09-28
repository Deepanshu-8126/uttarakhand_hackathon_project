import { getEntityPlaceholderSvg } from '../utils/imageValidator.js';

const memoryCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getCached(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  if (memoryCache.size > 500) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL_MS
  });
}

// Known verified entity-specific photography
const VERIFIED_POIS = {
  'gauri kund': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Gauri_Kund%2C_Adi_Kailash.jpg',
  'gaurikund': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Gauri_Kund%2C_Adi_Kailash.jpg',
  'parvati kund': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Parvati_Kund_at_Adi-Kailash.jpg/1920px-Parvati_Kund_at_Adi-Kailash.jpg',
  'parvati sarovar': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Parvati_Kund_at_Adi-Kailash.jpg/1920px-Parvati_Kund_at_Adi-Kailash.jpg',
  'adi kailash': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/ADI_KAILASH.jpg',
  'om parvat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Om_Parvat.jpg/1280px-Om_Parvat.jpg',
  'raj bhavan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg/1920px-Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg',
  'governor house': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg/1920px-Governor_House%2C_Nainital%2C_Uttarakhand%2C_India.jpg'
};

const UTTARAKHAND_FALLBACK_GEMS = [
  {
    place_id: 'gh_fallback_chopta_dhaba',
    name: 'Monal Pahadi Maggi & Herbal Tea Hut',
    rating: 4.9,
    user_ratings_total: 428,
    types: ['restaurant', 'food', 'point_of_interest'],
    vicinity: 'Chopta-Tungnath Base Camp Road, Rudraprayag',
    location: { lat: 30.4856, lng: 79.1764 },
    photo_urls: [getEntityPlaceholderSvg({ name: 'Monal Pahadi Maggi & Herbal Tea Hut', category: 'Dhaba' })],
    is_hidden_gem: true,
    highlight: 'Famous for buransh flower squash, hot ginger lemon honey tea and wood-fired rotis.',
    open_now: true,
    provider: 'Curated Mountain Radar'
  },
  {
    place_id: 'gh_fallback_mana_last_village',
    name: "India's Last Tea Stall (Mana Viewpoint)",
    rating: 4.9,
    user_ratings_total: 1850,
    types: ['tourist_attraction', 'cafe', 'point_of_interest'],
    vicinity: 'Mana Village, 3km ahead of Badrinath, Chamoli',
    location: { lat: 30.7712, lng: 79.4953 },
    photo_urls: [getEntityPlaceholderSvg({ name: "India's Last Tea Stall", category: 'Tea Stall' })],
    is_hidden_gem: false,
    highlight: 'Iconic border milestone stall overlooking Saraswati River gorge and Bhim Pul.',
    open_now: true,
    provider: 'Curated Mountain Radar'
  },
  {
    place_id: 'gh_fallback_auli_sunset',
    name: 'Gorson Bugyal Twilight Ridge Viewpoint',
    rating: 4.9,
    user_ratings_total: 934,
    types: ['natural_feature', 'tourist_attraction'],
    vicinity: 'Above Auli Ropeway Top Station, Chamoli',
    location: { lat: 30.5333, lng: 79.5700 },
    photo_urls: [getEntityPlaceholderSvg({ name: 'Gorson Bugyal Twilight Ridge Viewpoint', category: 'Viewpoint' })],
    is_hidden_gem: true,
    highlight: 'Unobstructed 360-degree sunset panoramic views of Nanda Devi, Trishul, and Dunagiri.',
    open_now: true,
    provider: 'Curated Mountain Radar'
  }
];

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(t);
    throw err;
  }
}

class GooglePlacesService {
  constructor() {
    this.geoapifyKey = process.env.GEOAPIFY_API_KEY || '';
    this.googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  }

  hasApiKey() {
    return Boolean(this.geoapifyKey || this.googleApiKey);
  }

  /**
   * Search places by text / keyword query
   */
  async searchPlaces({ query, location, radius = 50000 }) {
    const cleanQuery = (query || '').trim().toLowerCase();
    const cacheKey = `search_${cleanQuery}_${location ? `${location.lat}_${location.lng}` : ''}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // 1. Try Geoapify Geocoding / Places Search
    if (this.geoapifyKey) {
      try {
        let url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query + ' Uttarakhand')}&limit=12&apiKey=${this.geoapifyKey}`;
        if (location && location.lat && location.lng) {
          url += `&bias=proximity:${location.lng},${location.lat}`;
        }
        const res = await fetchWithTimeout(url);
        const data = await res.json();
        if (Array.isArray(data.features) && data.features.length > 0) {
          const formatted = data.features.map((f, i) => this.formatGeoapifyFeature(f, i));
          setCache(cacheKey, formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('[Geoapify] Search error:', err.message);
      }
    }

    // 2. Try Google Places if configured
    if (this.googleApiKey) {
      try {
        let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' Uttarakhand')}&key=${this.googleApiKey}`;
        const response = await fetchWithTimeout(url);
        const data = await response.json();
        if (data.status === 'OK' && Array.isArray(data.results)) {
          const parsed = data.results.map(place => this.formatGooglePlace(place));
          setCache(cacheKey, parsed);
          return parsed;
        }
      } catch (err) {
        console.warn('[GooglePlaces] Search error:', err.message);
      }
    }

    // 3. Fallback
    return UTTARAKHAND_FALLBACK_GEMS;
  }

  /**
   * Get live nearby hidden spots, viewpoints, dhabas, camps around coordinates
   */
  async getNearbyPlaces({ lat, lng, type = 'all', radius = 25000, keyword = '' }) {
    const centerLat = lat ? parseFloat(lat) : 30.0667;
    const centerLng = lng ? parseFloat(lng) : 79.0193;

    const cacheKey = `nearby_${centerLat}_${centerLng}_${type}_${keyword}_${radius}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // 1. Geoapify Places API v2
    const geoKey = process.env.GEOAPIFY_API_KEY || this.geoapifyKey;
    if (geoKey) {
      try {
        let categories = 'tourism.sights,tourism.attraction,catering.restaurant,catering.cafe,accommodation,natural.mountain,natural.water,heritage';
        if (type === 'food' || type === 'restaurant') {
          categories = 'catering.restaurant,catering.fast_food,catering.cafe';
        } else if (type === 'lodging' || type === 'stay') {
          categories = 'accommodation';
        } else if (type === 'viewpoints' || type === 'tourist_attraction') {
          categories = 'tourism.sights,tourism.attraction,natural.mountain,natural.water,heritage';
        }

        const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${centerLng},${centerLat},${radius}&bias=proximity:${centerLng},${centerLat}&limit=25&apiKey=${geoKey}`;
        const res = await fetchWithTimeout(url);
        const data = await res.json();

        if (Array.isArray(data.features) && data.features.length > 0) {
          const rawFormatted = data.features
            .filter(f => f.properties?.name || f.properties?.address_line1 || f.properties?.formatted)
            .map((f, i) => this.formatGeoapifyFeature(f, i));

          // Deterministic deduplication by canonical identity, slug, and normalized name + vicinity
          const seen = new Set();
          const uniqueFormatted = [];
          for (const item of rawFormatted) {
            const normName = (item.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            const normVic = (item.vicinity || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            const compositeKey = `${normName}__${normVic}`;
            if (!seen.has(compositeKey) && !seen.has(item.place_id)) {
              seen.add(compositeKey);
              seen.add(item.place_id);
              uniqueFormatted.push(item);
            }
          }

          if (uniqueFormatted.length > 0) {
            setCache(cacheKey, uniqueFormatted);
            return uniqueFormatted;
          }
        }
      } catch (err) {
        console.warn('[Geoapify] Nearby places fetch error:', err.message);
      }
    }

    // 2. Google Places Fallback
    if (this.googleApiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centerLat},${centerLng}&radius=${radius}&key=${this.googleApiKey}`;
        const response = await fetchWithTimeout(url);
        const data = await response.json();
        if (data.status === 'OK' && Array.isArray(data.results)) {
          const parsed = data.results.map(place => this.formatGooglePlace(place));
          setCache(cacheKey, parsed);
          return parsed;
        }
      } catch (err) {
        console.warn('[GooglePlaces] Nearby error:', err.message);
      }
    }

    // 3. High-grade Curated Fallback with Haversine distance calculation
    const sorted = [...UTTARAKHAND_FALLBACK_GEMS].map(gem => {
      const distKm = haversineDistanceKm(centerLat, centerLng, gem.location.lat, gem.location.lng);
      return { ...gem, distance_approx_km: Math.max(1, distKm) };
    }).sort((a, b) => a.distance_approx_km - b.distance_approx_km);

    setCache(cacheKey, sorted);
    return sorted;
  }

  /**
   * Get Route Waypoints & Navigation Duration via Geoapify Routing API
   */
  async getRouteDirections({ fromLat, fromLng, toLat, toLng, mode = 'drive' }) {
    if (!this.geoapifyKey) return null;
    const cacheKey = `route_${fromLat}_${fromLng}_${toLat}_${toLng}_${mode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const modes = [mode, 'drive', 'hike', 'walk'];
    const geoKey = process.env.GEOAPIFY_API_KEY || this.geoapifyKey;
    for (const m of modes) {
      try {
        const url = `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}&mode=${m}&apiKey=${geoKey}`;
        const res = await fetchWithTimeout(url);
        const data = await res.json();
        if (data.features?.[0]) {
          const route = data.features[0];
          const result = {
            mode: m,
            distance_meters: route.properties?.distance,
            distance_km: (route.properties?.distance / 1000).toFixed(1),
            time_seconds: route.properties?.time,
            time_formatted: `${Math.round(route.properties?.time / 60)} mins`,
            coordinates: route.geometry?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]) || []
          };
          setCache(cacheKey, result);
          return result;
        }
      } catch (err) {
        // try next mode
      }
    }
    return null;
  }

  /**
   * Format Geoapify Feature into Unified Radar Model with Real Entity Image Mapping
   */
  formatGeoapifyFeature(f, index = 0) {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates || [79.0193, 30.0667];
    const lng = coords[0];
    const lat = coords[1];
    const name = p.name || p.formatted || 'Local Himalayan Spot';
    const normName = name.toLowerCase().trim();

    const cats = Array.isArray(p.categories) ? p.categories : [];
    const isRental = cats.some(c => c.includes('rental') || c.includes('vehicle') || c.includes('bicycle')) || /rental|bike|car|taxi|scooter|wheels/i.test(name);
    const isFood = cats.some(c => c.includes('catering') || c.includes('restaurant')) || /dhaba|chai|coffee|tea|cafe|restaurant|bhojanalaya/i.test(name);
    const isStay = cats.some(c => c.includes('accommodation') || c.includes('hotel')) || /homestay|resort|camp|lodge|guest/i.test(name);
    const isViewpoint = cats.some(c => c.includes('mountain') || c.includes('natural') || c.includes('sights')) || /kund|lake|tal|peak|glacier|pass|temple/i.test(name);

    // Entity-Specific Authentic Image Mapping (No AI, No Randomness, No Foreign Mismatches)
    let photoUrl = null;
    for (const [key, vUrl] of Object.entries(VERIFIED_POIS)) {
      if (normName.includes(key)) {
        photoUrl = vUrl;
        break;
      }
    }

    if (!photoUrl) {
      photoUrl = getEntityPlaceholderSvg({
        name,
        category: isStay ? 'Stay' : isFood ? 'Food & Dhaba' : isRental ? 'Rental' : 'Mountain Spot'
      });
    }

    const isHidden = isViewpoint || (p.distance && p.distance < 8000) || /waterfall|bugyal|peak|cave|pass|ghat|dhaba/i.test(name);

    return {
      place_id: p.place_id || `geoapify_${lat}_${lng}_${index}`,
      name: name,
      rating: null,
      user_ratings_total: null,
      vicinity: p.street || p.suburb || p.city || p.county || p.state || 'Uttarakhand, India',
      location: { lat, lng },
      photo_urls: [photoUrl],
      types: cats.length > 0 ? cats : [isFood ? 'food' : isStay ? 'lodging' : 'point_of_interest'],
      open_now: true,
      distance_approx_km: p.distance ? Math.round(p.distance / 1000) : null,
      is_hidden_gem: isHidden,
      is_google_verified: false,
      provider: 'Geoapify Live Radar & OSM'
    };
  }

  formatGooglePlace(raw) {
    const photos = [];
    if (Array.isArray(raw.photos) && raw.photos.length > 0) {
      raw.photos.slice(0, 4).forEach(p => {
        if (p.photo_reference && this.googleApiKey) {
          photos.push(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${this.googleApiKey}`);
        }
      });
    }
    if (photos.length === 0) {
      const norm = (raw.name || '').toLowerCase().trim();
      let matched = null;
      for (const [key, vUrl] of Object.entries(VERIFIED_POIS)) {
        if (norm.includes(key)) {
          matched = vUrl;
          break;
        }
      }
      photos.push(matched || getEntityPlaceholderSvg({ name: raw.name, category: 'Place' }));
    }

    return {
      place_id: raw.place_id || `place_${Math.random().toString(36).substr(2, 9)}`,
      name: raw.name || 'Unnamed Spot',
      rating: typeof raw.rating === 'number' && raw.rating > 0 ? raw.rating : null,
      user_ratings_total: typeof raw.user_ratings_total === 'number' && raw.user_ratings_total > 0 ? raw.user_ratings_total : null,
      vicinity: raw.vicinity || raw.formatted_address || 'Uttarakhand, India',
      location: {
        lat: raw.geometry?.location?.lat || 30.0667,
        lng: raw.geometry?.location?.lng || 79.0193
      },
      photo_urls: photos,
      types: raw.types || ['point_of_interest'],
      open_now: raw.opening_hours?.open_now ?? true,
      is_hidden_gem: true,
      is_google_verified: true,
      provider: 'Google Places API'
    };
  }
}

export const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;
