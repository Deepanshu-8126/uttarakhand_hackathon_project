/**
 * Discovery Uttarakhand — User Location Resolution & Proximity Engine
 * Grounded geospatial resolution using real MongoDB 2dsphere records and canonical Uttarakhand geography.
 * Zero fabricated data. Zero hardcoded fake lists.
 */

import Destination from '../models/Destination.js';
import Stay from '../models/Stay.js';
import Rental from '../models/Rental.js';
import Guide from '../models/Guide.js';
import Activity from '../models/Activity.js';
import Spiritual from '../models/Spiritual.js';
import Culture from '../models/Culture.js';

// Official 13 Himalayan Districts of Uttarakhand
export const UTTARAKHAND_DISTRICTS = [
  'Almora',
  'Bageshwar',
  'Chamoli',
  'Champawat',
  'Dehradun',
  'Haridwar',
  'Nainital',
  'Pauri Garhwal',
  'Pithoragarh',
  'Rudraprayag',
  'Tehri Garhwal',
  'Udham Singh Nagar',
  'Uttarkashi'
];

// Distance classification thresholds (configurable in kilometers)
export const PROXIMITY_TIERS = {
  HIGHLY_NEARBY_MAX_KM: 10,
  NEARBY_MAX_KM: 30,
  REGIONAL_MAX_KM: 75
};

// Canonical Centroids & Hubs for Uttarakhand Cities & Districts
// [longitude, latitude] strictly in GeoJSON format
export const CANONICAL_COORDINATES = {
  'nainital': { coordinates: [79.4636, 29.3919], district: 'Nainital', city: 'Nainital' },
  'haldwani': { coordinates: [79.5130, 29.2183], district: 'Nainital', city: 'Haldwani' },
  'bhimtal': { coordinates: [79.5539, 29.3500], district: 'Nainital', city: 'Bhimtal' },
  'bhowali': { coordinates: [79.5167, 29.3833], district: 'Nainital', city: 'Bhowali' },
  'mukteshwar': { coordinates: [79.6469, 29.4722], district: 'Nainital', city: 'Mukteshwar' },
  'ramgarh': { coordinates: [79.5500, 29.4200], district: 'Nainital', city: 'Ramgarh' },
  'sattal': { coordinates: [79.5333, 29.3500], district: 'Nainital', city: 'Sattal' },
  'naukuchiatal': { coordinates: [79.5833, 29.3167], district: 'Nainital', city: 'Naukuchiatal' },
  'kathgodam': { coordinates: [79.5300, 29.2700], district: 'Nainital', city: 'Kathgodam' },
  'ramnagar': { coordinates: [79.1272, 29.3967], district: 'Nainital', city: 'Ramnagar' },
  'corbett': { coordinates: [78.9629, 29.5300], district: 'Nainital', city: 'Ramnagar' },

  'dehradun': { coordinates: [78.0322, 30.3165], district: 'Dehradun', city: 'Dehradun' },
  'rishikesh': { coordinates: [78.2676, 30.0869], district: 'Dehradun', city: 'Rishikesh' },
  'mussoorie': { coordinates: [78.0700, 30.4598], district: 'Dehradun', city: 'Mussoorie' },
  'chakrata': { coordinates: [77.8683, 30.7022], district: 'Dehradun', city: 'Chakrata' },

  'haridwar': { coordinates: [78.1642, 29.9457], district: 'Haridwar', city: 'Haridwar' },
  'roorkee': { coordinates: [77.8880, 29.8543], district: 'Haridwar', city: 'Roorkee' },

  'almora': { coordinates: [79.6608, 29.5971], district: 'Almora', city: 'Almora' },
  'ranikhet': { coordinates: [79.4316, 29.6434], district: 'Almora', city: 'Ranikhet' },
  'binsar': { coordinates: [79.7500, 29.7000], district: 'Almora', city: 'Binsar' },
  'jageshwar': { coordinates: [79.8500, 29.6400], district: 'Almora', city: 'Jageshwar' },

  'bageshwar': { coordinates: [79.7711, 29.8406], district: 'Bageshwar', city: 'Bageshwar' },
  'kausani': { coordinates: [79.6000, 29.8500], district: 'Bageshwar', city: 'Kausani' },
  'baijnath': { coordinates: [79.6167, 29.9000], district: 'Bageshwar', city: 'Baijnath' },

  'pithoragarh': { coordinates: [80.2181, 29.5829], district: 'Pithoragarh', city: 'Pithoragarh' },
  'munsyari': { coordinates: [80.2400, 30.0667], district: 'Pithoragarh', city: 'Munsyari' },
  'dharchula': { coordinates: [80.5350, 29.8497], district: 'Pithoragarh', city: 'Dharchula' },

  'champawat': { coordinates: [80.1006, 29.3364], district: 'Champawat', city: 'Champawat' },
  'lohaghat': { coordinates: [80.0900, 29.4100], district: 'Champawat', city: 'Lohaghat' },

  'rudrapur': { coordinates: [79.4000, 28.9800], district: 'Udham Singh Nagar', city: 'Rudrapur' },
  'kashipur': { coordinates: [78.9600, 29.2100], district: 'Udham Singh Nagar', city: 'Kashipur' },

  'rudraprayag': { coordinates: [78.9800, 30.2800], district: 'Rudraprayag', city: 'Rudraprayag' },
  'kedarnath': { coordinates: [79.0669, 30.7352], district: 'Rudraprayag', city: 'Kedarnath' },
  'guptkashi': { coordinates: [79.0800, 30.5200], district: 'Rudraprayag', city: 'Guptkashi' },
  'chopta': { coordinates: [79.1700, 30.4800], district: 'Rudraprayag', city: 'Chopta' },

  'chamoli': { coordinates: [79.3333, 30.4167], district: 'Chamoli', city: 'Gopeshwar' },
  'gopeshwar': { coordinates: [79.3333, 30.4167], district: 'Chamoli', city: 'Gopeshwar' },
  'joshimath': { coordinates: [79.5667, 30.5667], district: 'Chamoli', city: 'Joshimath' },
  'badrinath': { coordinates: [79.4938, 30.7433], district: 'Chamoli', city: 'Badrinath' },
  'auli': { coordinates: [79.5667, 30.5333], district: 'Chamoli', city: 'Auli' },

  'tehri garhwal': { coordinates: [78.4800, 30.3800], district: 'Tehri Garhwal', city: 'New Tehri' },
  'new tehri': { coordinates: [78.4800, 30.3800], district: 'Tehri Garhwal', city: 'New Tehri' },
  'dhanaulti': { coordinates: [78.2300, 30.4500], district: 'Tehri Garhwal', city: 'Dhanaulti' },
  'kanatal': { coordinates: [78.3400, 30.4100], district: 'Tehri Garhwal', city: 'Kanatal' },

  'uttarkashi': { coordinates: [78.4354, 30.7268], district: 'Uttarkashi', city: 'Uttarkashi' },
  'gangotri': { coordinates: [78.9398, 30.9947], district: 'Uttarkashi', city: 'Gangotri' },
  'yamunotri': { coordinates: [78.4590, 31.0140], district: 'Uttarkashi', city: 'Yamunotri' },
  'harsil': { coordinates: [78.7300, 31.0300], district: 'Uttarkashi', city: 'Harsil' },

  'pauri garhwal': { coordinates: [78.7800, 30.1500], district: 'Pauri Garhwal', city: 'Pauri' },
  'pauri': { coordinates: [78.7800, 30.1500], district: 'Pauri Garhwal', city: 'Pauri' },
  'lansdowne': { coordinates: [78.6800, 29.8400], district: 'Pauri Garhwal', city: 'Lansdowne' },
  'srinagar': { coordinates: [78.7800, 30.2200], district: 'Pauri Garhwal', city: 'Srinagar' },
  'kotdwar': { coordinates: [78.5200, 29.7500], district: 'Pauri Garhwal', city: 'Kotdwar' }
};

/**
 * Haversine formula to compute distance in km between two GeoJSON points [lng, lat]
 * @param {Array<number>} coords1 - [longitude, latitude]
 * @param {Array<number>} coords2 - [longitude, latitude]
 * @returns {number|null} distance in km rounded to 1 decimal place
 */
export function calculateHaversineDistanceKm(coords1, coords2) {
  if (!Array.isArray(coords1) || !Array.isArray(coords2) || coords1.length !== 2 || coords2.length !== 2) {
    return null;
  }
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;

  if (typeof lat1 !== 'number' || typeof lng1 !== 'number' || typeof lat2 !== 'number' || typeof lng2 !== 'number') {
    return null;
  }

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Classify distance into strict ranking proximity tiers
 * @param {number|null} distanceKm
 * @returns {string} HIGHLY_NEARBY | NEARBY | REGIONAL | GENERAL_DISCOVERY | DISTRICT_FALLBACK
 */
export function classifyProximity(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) {
    return 'DISTRICT_FALLBACK';
  }
  if (distanceKm <= PROXIMITY_TIERS.HIGHLY_NEARBY_MAX_KM) {
    return 'HIGHLY_NEARBY';
  }
  if (distanceKm <= PROXIMITY_TIERS.NEARBY_MAX_KM) {
    return 'NEARBY';
  }
  if (distanceKm <= PROXIMITY_TIERS.REGIONAL_MAX_KM) {
    return 'REGIONAL';
  }
  return 'GENERAL_DISCOVERY';
}

/**
 * Normalizes and resolves a location object or string into canonical coordinates & district
 * @param {Object|string} input - user location input (e.g. "Nainital", { city: "Nainital", district: "Nainital" }, or GPS coords)
 * @returns {Promise<Object>} resolved location details
 */
export async function resolveLocation(input) {
  if (!input) return null;

  let city = '';
  let district = '';
  let state = 'Uttarakhand';
  let country = 'India';
  let coordinates = null;

  if (typeof input === 'string') {
    const parts = input.split(',').map(s => s.trim());
    city = parts[0] || '';
    if (parts.length > 1) {
      district = parts[1];
    }
  } else if (typeof input === 'object') {
    city = input.city || input.name || '';
    district = input.district || '';
    state = input.state || 'Uttarakhand';
    country = input.country || 'India';

    if (Array.isArray(input.coordinates) && input.coordinates.length === 2) {
      // Validate valid GeoJSON [lng, lat]
      const [lng, lat] = input.coordinates;
      if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
        coordinates = [lng, lat];
      }
    } else if (input.coordinates?.coordinates && Array.isArray(input.coordinates.coordinates)) {
      coordinates = input.coordinates.coordinates;
    } else if (input.latitude && input.longitude) {
      coordinates = [Number(input.longitude), Number(input.latitude)];
    }
  }

  const lookupKey = (city || district || '').toLowerCase().trim();

  // 1. If explicit coordinates are present, resolve district/city if missing
  if (coordinates && (!city || !district)) {
    // Find closest known canonical hub or MongoDB destination
    let closestDist = Infinity;
    let closestHub = null;

    for (const [key, hub] of Object.entries(CANONICAL_COORDINATES)) {
      const d = calculateHaversineDistanceKm(coordinates, hub.coordinates);
      if (d !== null && d < closestDist) {
        closestDist = d;
        closestHub = hub;
      }
    }

    if (closestHub && closestDist <= 35) {
      if (!city) city = closestHub.city;
      if (!district) district = closestHub.district;
    }
  }

  // 2. If coordinates are missing, resolve from Canonical Table
  if (!coordinates && lookupKey) {
    if (CANONICAL_COORDINATES[lookupKey]) {
      coordinates = CANONICAL_COORDINATES[lookupKey].coordinates;
      if (!district) district = CANONICAL_COORDINATES[lookupKey].district;
      if (!city) city = CANONICAL_COORDINATES[lookupKey].city;
    } else {
      // Check partial matches in canonical coordinates
      const matchedKey = Object.keys(CANONICAL_COORDINATES).find(k => lookupKey.includes(k) || k.includes(lookupKey));
      if (matchedKey) {
        coordinates = CANONICAL_COORDINATES[matchedKey].coordinates;
        if (!district) district = CANONICAL_COORDINATES[matchedKey].district;
        if (!city) city = CANONICAL_COORDINATES[matchedKey].city;
      }
    }
  }

  // 3. If still missing coordinates, query real MongoDB Destination records
  if (!coordinates && (city || district)) {
    try {
      const query = city ? { name: new RegExp(`^${city}$`, 'i') } : { district: new RegExp(`^${district}$`, 'i') };
      const destDoc = await Destination.findOne(query).select('name district location coordinates latitude longitude').lean();
      if (destDoc) {
        if (destDoc.location?.coordinates && Array.isArray(destDoc.location.coordinates) && destDoc.location.coordinates.length === 2) {
          coordinates = destDoc.location.coordinates;
        } else if (destDoc.longitude && destDoc.latitude) {
          coordinates = [destDoc.longitude, destDoc.latitude];
        }
        if (!district && destDoc.district) district = destDoc.district;
        if (!city && destDoc.name) city = destDoc.name;
      }
    } catch (e) {
      console.warn('[LocationService] MongoDB coordinate lookup error:', e.message);
    }
  }

  // 4. District canonicalization
  if (district) {
    const canonicalDistrict = UTTARAKHAND_DISTRICTS.find(d => d.toLowerCase() === district.toLowerCase());
    if (canonicalDistrict) district = canonicalDistrict;
  }

  return {
    city: city || district || 'Uttarakhand',
    district: district || city || 'Uttarakhand',
    state,
    country,
    coordinates: coordinates || null, // [lng, lat] GeoJSON or null
    hasCoordinates: !!coordinates
  };
}

/**
 * Execute real MongoDB proximity queries across destinations, stays, rentals, guides, activities, spiritual, culture
 * @param {Object} params
 * @param {Array<number>} [params.coordinates] - [longitude, latitude] GeoJSON
 * @param {string} [params.district] - District name (fallback or primary)
 * @param {string} [params.city] - City name
 * @param {number} [params.radiusKm=75] - Max proximity radius in kilometers
 * @param {Array<string>} [params.interests=[]] - User interests to bias ranking
 * @param {number} [params.limit=10] - Max items per category
 * @returns {Promise<Object>} Map of categorized nearby entities
 */
export async function findNearbyEntities({
  coordinates = null,
  district = null,
  city = null,
  radiusKm = 75,
  interests = [],
  limit = 8
} = {}) {
  const maxMeters = radiusKm * 1000;
  const hasCoords = Array.isArray(coordinates) && coordinates.length === 2 &&
    typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number';

  const cleanDistrict = district ? district.trim() : null;
  const cleanCity = city ? city.trim() : null;

  // Build helper to query MongoDB using 2dsphere $near when coordinates are valid,
  // with graceful fallback to district matching if 2dsphere yields too few records or for unindexed docs
  const queryGeoOrDistrict = async (Model, extraFilter = {}) => {
    let results = [];

    if (hasCoords) {
      try {
        const geoQuery = {
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates },
              $maxDistance: maxMeters
            }
          },
          ...extraFilter
        };
        results = await Model.find(geoQuery).limit(limit).lean();
      } catch (err) {
        console.warn(`[LocationService] $near query failed for ${Model.modelName}:`, err.message);
      }
    }

    // Fallback: If no coords or geo query returned 0 items, query by district or city
    if (results.length === 0 && (cleanDistrict || cleanCity)) {
      const matchConditions = [];
      if (cleanDistrict) matchConditions.push({ district: new RegExp(`^${cleanDistrict}$`, 'i') });
      if (cleanCity) {
        matchConditions.push({ city: new RegExp(`^${cleanCity}$`, 'i') });
        matchConditions.push({ name: new RegExp(`\\b${cleanCity}\\b`, 'i') });
      }

      try {
        const fallbackQuery = {
          $or: matchConditions,
          ...extraFilter
        };
        results = await Model.find(fallbackQuery).limit(limit).lean();
      } catch (err) {
        console.warn(`[LocationService] Fallback query failed for ${Model.modelName}:`, err.message);
      }
    }

    // Annotate results with genuine distance and proximity tiers (NEVER FABRICATE)
    return results.map(doc => {
      let docCoords = null;
      if (doc.location?.coordinates && Array.isArray(doc.location.coordinates) && doc.location.coordinates.length === 2) {
        docCoords = doc.location.coordinates;
      } else if (doc.longitude && doc.latitude) {
        docCoords = [doc.longitude, doc.latitude];
      }

      let distanceKm = null;
      if (hasCoords && docCoords) {
        distanceKm = calculateHaversineDistanceKm(coordinates, docCoords);
      }

      const proximityTier = distanceKm !== null ? classifyProximity(distanceKm) : 'DISTRICT_MATCH';

      return {
        ...doc,
        distanceKm,
        proximityTier,
        distanceText: distanceKm !== null ? `${distanceKm} km away` : (doc.district ? `District: ${doc.district}` : 'Uttarakhand')
      };
    }).sort((a, b) => {
      // Sort items with genuine distance first
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });
  };

  // Special handler for Guides (Guides often have districts array instead of single GeoJSON location)
  const queryNearbyGuides = async () => {
    try {
      const conditions = [];
      if (cleanDistrict) {
        conditions.push({ districts: new RegExp(`^${cleanDistrict}$`, 'i') });
        conditions.push({ location: new RegExp(`\\b${cleanDistrict}\\b`, 'i') });
      }
      if (cleanCity) {
        conditions.push({ location: new RegExp(`\\b${cleanCity}\\b`, 'i') });
      }

      let guidesQuery = conditions.length > 0 ? { $or: conditions } : {};
      let guides = await Guide.find(guidesQuery).limit(limit).lean();

      if (guides.length === 0) {
        guides = await Guide.find({}).limit(Math.min(limit, 4)).lean();
      }

      // Rank by interest if user has preferences (e.g. trekking, nature, spiritual)
      return guides.map(g => {
        let isMatchingInterest = false;
        if (interests && interests.length > 0 && Array.isArray(g.specialties)) {
          isMatchingInterest = g.specialties.some(s =>
            interests.some(i => s.toLowerCase().includes(i.toLowerCase()))
          );
        }

        return {
          ...g,
          distanceKm: null, // Guides operate regionally across districts
          proximityTier: cleanDistrict && (g.districts || []).some(d => d.toLowerCase() === cleanDistrict.toLowerCase()) ? 'DISTRICT_MATCH' : 'REGIONAL',
          distanceText: cleanDistrict && (g.districts || []).some(d => d.toLowerCase() === cleanDistrict.toLowerCase()) ? `Local to ${cleanDistrict}` : 'Regional Himalayan Guide',
          isMatchingInterest
        };
      });
    } catch (e) {
      console.warn('[LocationService] Guide query error:', e.message);
      return [];
    }
  };

  // Execute all entity queries concurrently
  const [
    destinations,
    stays,
    rentals,
    activities,
    guides,
    spiritual,
    culture
  ] = await Promise.all([
    queryGeoOrDistrict(Destination),
    queryGeoOrDistrict(Stay),
    queryGeoOrDistrict(Rental),
    queryGeoOrDistrict(Activity),
    queryNearbyGuides(),
    queryGeoOrDistrict(Spiritual),
    queryGeoOrDistrict(Culture)
  ]);

  // Combine top recommended experiences (destinations + activities + spiritual + culture)
  const recommendedExperiences = [
    ...destinations.slice(0, 3).map(d => ({ ...d, experienceType: 'Destination' })),
    ...activities.slice(0, 3).map(a => ({ ...a, experienceType: 'Activity' })),
    ...spiritual.slice(0, 2).map(s => ({ ...s, experienceType: 'Spiritual' })),
    ...culture.slice(0, 2).map(c => ({ ...c, experienceType: 'Culture' }))
  ].sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
    return 0;
  });

  return {
    nearbyDestinations: destinations,
    nearbyStays: stays,
    nearbyRentals: rentals,
    nearbyGuides: guides,
    nearbyActivities: activities,
    nearbySpiritual: spiritual,
    nearbyCulture: culture,
    recommendedExperiences
  };
}

export default {
  UTTARAKHAND_DISTRICTS,
  PROXIMITY_TIERS,
  CANONICAL_COORDINATES,
  calculateHaversineDistanceKm,
  classifyProximity,
  resolveLocation,
  findNearbyEntities
};
