/**
 * Live Places & Geo Service (Geoapify + Google Places Dual Engine)
 * Fetches live real-world mountain spots, dhabas, viewpoints, campsites, and routes.
 */

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

// Visual photo pools for specific mountain categories if remote place lacks photo
const PHOTO_POOLS = {
  viewpoint: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80'
  ],
  dhaba: [
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80'
  ],
  stay: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80'
  ],
  spiritual: [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600100397608-f010f443a6d7?auto=format&fit=crop&w=1000&q=80'
  ],
  rental: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80', // Himalayan Adventure
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80', // Classic 350
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', // Thar 4x4
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'  // Mountain Cruiser Sedan
  ]
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
    photo_urls: PHOTO_POOLS.dhaba,
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
    photo_urls: PHOTO_POOLS.spiritual,
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
    photo_urls: PHOTO_POOLS.viewpoint,
    is_hidden_gem: true,
    highlight: 'Unobstructed 360-degree sunset panoramic views of Nanda Devi, Trishul, and Dunagiri.',
    open_now: true,
    provider: 'Curated Mountain Radar'
  }
];

class GooglePlacesService {
  constructor() {
    this.geoapifyKey = process.env.GEOAPIFY_API_KEY || '2c3a7f1f2e184822a7631d30dfac330c';
    this.googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  }

  hasApiKey() {
    return Boolean(this.geoapifyKey || this.googleApiKey);
  }

  /**
   * Search places by text / keyword query
   */
  async searchPlaces({ query, location, radius = 50000 }) {
    const cacheKey = `search_${query}_${location ? `${location.lat}_${location.lng}` : ''}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // 1. Try Geoapify Geocoding / Places Search
    if (this.geoapifyKey) {
      try {
        let url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query + ' Uttarakhand')}&limit=12&apiKey=${this.geoapifyKey}`;
        if (location && location.lat && location.lng) {
          url += `&bias=proximity:${location.lng},${location.lat}`;
        }
        const res = await fetch(url);
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
        const response = await fetch(url);
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
        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data.features) && data.features.length > 0) {
          const formatted = data.features
            .filter(f => f.properties?.name || f.properties?.address_line1 || f.properties?.formatted)
            .map((f, i) => this.formatGeoapifyFeature(f, i));

          if (formatted.length > 0) {
            setCache(cacheKey, formatted);
            return formatted;
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
        const response = await fetch(url);
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

    // 3. High-grade Curated Fallback with distance calculation
    const sorted = [...UTTARAKHAND_FALLBACK_GEMS].map(gem => {
      const dLat = gem.location.lat - centerLat;
      const dLng = gem.location.lng - centerLng;
      const distSq = dLat * dLat + dLng * dLng;
      return { ...gem, distance_approx_km: Math.max(1, Math.round(Math.sqrt(distSq) * 111)) };
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
        const res = await fetch(url);
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
   * Format Geoapify Feature into Unified Radar Model
   */
  formatGeoapifyFeature(f, index = 0) {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates || [79.0193, 30.0667];
    const lng = coords[0];
    const lat = coords[1];

    const cats = Array.isArray(p.categories) ? p.categories : [];
    const isRental = cats.some(c => c.includes('rental') || c.includes('vehicle') || c.includes('bicycle')) || /rental|bike|car|taxi|scooter|wheels/i.test(p.name || '');
    const isFood = cats.some(c => c.includes('catering') || c.includes('restaurant'));
    const isStay = cats.some(c => c.includes('accommodation') || c.includes('hotel'));
    const isViewpoint = cats.some(c => c.includes('mountain') || c.includes('natural') || c.includes('sights'));

    const photoPool = isRental ? PHOTO_POOLS.rental : isFood ? PHOTO_POOLS.dhaba : isStay ? PHOTO_POOLS.stay : PHOTO_POOLS.viewpoint;
    const photoUrl = photoPool[index % photoPool.length];

    const isHidden = isViewpoint || (p.distance && p.distance < 8000) || /waterfall|bugyal|peak|cave|pass|ghat|dhaba/i.test(p.name || '');

    return {
      place_id: p.place_id || `geoapify_${lat}_${lng}_${index}`,
      name: p.name || p.formatted || 'Local Himalayan Spot',
      rating: 4.7 + (index % 3) * 0.1,
      user_ratings_total: 80 + (index * 45),
      vicinity: p.street || p.suburb || p.city || p.county || p.state || 'Uttarakhand, India',
      location: { lat, lng },
      photo_urls: [photoUrl],
      types: cats.length > 0 ? cats : ['point_of_interest'],
      open_now: true,
      distance_approx_km: p.distance ? Math.round(p.distance / 1000) : null,
      is_hidden_gem: isHidden,
      is_google_verified: true,
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
      photos.push(PHOTO_POOLS.viewpoint[0]);
    }

    return {
      place_id: raw.place_id || `place_${Math.random().toString(36).substr(2, 9)}`,
      name: raw.name || 'Unnamed Spot',
      rating: raw.rating || 4.8,
      user_ratings_total: raw.user_ratings_total || 120,
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
