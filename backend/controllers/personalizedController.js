/**
 * Discovery Uttarakhand — Personalized Location-Based Discovery Controller
 * Serves real MongoDB records based on authenticated user's location or guest device location.
 * Implements strict per-user/location cache isolation. Zero fake records.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { resolveLocation, findNearbyEntities } from '../services/locationService.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

// Cache TTL: 600 seconds (10 minutes)
const PERSONALIZED_CACHE_TTL = 600;

/**
 * Helper to resolve authenticated user from Bearer token if present
 */
async function resolveOptionalUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.id) {
      return await User.findById(decoded.id).select('-password').lean();
    }
  } catch (err) {
    // Ignore invalid/expired tokens for optional authentication
  }
  return null;
}

/**
 * Generate a cache key that strictly isolates personalized data per user or location.
 * Prevents user A's Nainital data from ever leaking to user B from Haldwani.
 */
function buildPersonalizedCacheKey(userId, resolvedLocation) {
  if (userId) {
    return `pers_home:u_${userId}`;
  }
  const city = (resolvedLocation?.city || 'uk').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const district = (resolvedLocation?.district || 'uk').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const coordsPart = resolvedLocation?.coordinates 
    ? `${Math.round(resolvedLocation.coordinates[0] * 100)}_${Math.round(resolvedLocation.coordinates[1] * 100)}` 
    : 'nocoords';
  return `pers_home:g_${city}_${district}_${coordsPart}`;
}

/**
 * Invalidate personalized cache for a user when location or preferences change
 */
export async function invalidateUserPersonalizedCache(userId) {
  if (!userId) return;
  try {
    await cacheDel(`pers_home:u_${userId}`);
  } catch (e) {
    console.warn('[PersonalizedController] Cache invalidation warning:', e.message);
  }
}

/**
 * @desc    Get personalized home discovery (Nearby destinations, stays, rentals, guides, activities)
 * @route   GET /api/personalized/home
 * @access  Public (Contextual - Logged-in profile or guest session query)
 */
export const getPersonalizedHome = async (req, res) => {
  try {
    const user = await resolveOptionalUser(req);
    const { city, district, lat, lng, radius, refresh } = req.query;

    let targetLocationInput = null;
    let locationSource = 'DEFAULT_DISCOVERY';

    // 1. Transient query params (e.g. "Use current location" or Guest manual city pick)
    if (city || district || (lat && lng)) {
      targetLocationInput = {
        city: city ? String(city).trim() : undefined,
        district: district ? String(district).trim() : undefined,
        coordinates: (lat && lng) ? [parseFloat(lng), parseFloat(lat)] : undefined
      };
      locationSource = (lat && lng) ? 'DEVICE_SESSION' : 'MANUAL_SESSION';
    } else if (user?.location) {
      // 2. Saved user profile location
      targetLocationInput = user.location;
      locationSource = 'SAVED_PROFILE';
    }

    // If neither exists, user is a guest without any location set
    if (!targetLocationInput) {
      return res.status(200).json({
        success: true,
        userLocation: null,
        locationSource: 'NONE',
        message: 'No location provided. Public Uttarakhand discovery active.',
        nearbyDestinations: [],
        nearbyStays: [],
        nearbyRentals: [],
        nearbyGuides: [],
        nearbyActivities: [],
        nearbySpiritual: [],
        nearbyCulture: [],
        recommendedExperiences: []
      });
    }

    // Resolve canonical location and coordinates
    const resolvedLocation = await resolveLocation(targetLocationInput);
    if (!resolvedLocation) {
      return res.status(200).json({
        success: true,
        userLocation: null,
        locationSource: 'UNRESOLVED',
        nearbyDestinations: [],
        nearbyStays: [],
        nearbyRentals: [],
        nearbyGuides: [],
        nearbyActivities: [],
        nearbySpiritual: [],
        nearbyCulture: [],
        recommendedExperiences: []
      });
    }

    // Cache check (Skip if refresh=true requested)
    const cacheKey = buildPersonalizedCacheKey(locationSource === 'SAVED_PROFILE' ? user?._id : null, resolvedLocation);
    if (refresh !== 'true') {
      try {
        const cached = await cacheGet(cacheKey);
        if (cached && typeof cached === 'object') {
          return res.status(200).json({
            ...cached,
            meta: { cached: true, cacheKey, locationSource }
          });
        }
      } catch (err) {
        // Cache miss or error — proceed to DB
      }
    }

    // Proximity radius (default 75km, max 150km)
    const parsedRadius = Math.min(Math.max(parseInt(radius, 10) || 75, 10), 150);

    // Fetch real nearby records from MongoDB
    const nearbyResults = await findNearbyEntities({
      coordinates: resolvedLocation.coordinates,
      district: resolvedLocation.district,
      city: resolvedLocation.city,
      radiusKm: parsedRadius,
      interests: user?.interests || [],
      limit: 8
    });

    const responsePayload = {
      success: true,
      locationSource,
      userLocation: {
        city: resolvedLocation.city,
        district: resolvedLocation.district,
        state: resolvedLocation.state,
        country: resolvedLocation.country,
        coordinates: resolvedLocation.coordinates,
        hasCoordinates: resolvedLocation.hasCoordinates,
        source: locationSource
      },
      ...nearbyResults,
      meta: {
        cached: false,
        locationSource,
        timestamp: new Date().toISOString()
      }
    };

    // Store in cache with strict key isolation
    try {
      await cacheSet(cacheKey, responsePayload, PERSONALIZED_CACHE_TTL);
    } catch (err) {
      console.warn('[PersonalizedController] Redis cacheSet error:', err.message);
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[GetPersonalizedHome Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate personalized recommendations',
      error: error.message
    });
  }
};

/**
 * @desc    Get nearby records for a specific category
 * @route   GET /api/personalized/nearby
 * @access  Public
 */
export const getPersonalizedNearby = async (req, res) => {
  try {
    const user = await resolveOptionalUser(req);
    const { category, city, district, lat, lng, radius, limit } = req.query;

    const targetInput = (city || district || (lat && lng)) 
      ? {
          city: city ? String(city).trim() : undefined,
          district: district ? String(district).trim() : undefined,
          coordinates: (lat && lng) ? [parseFloat(lng), parseFloat(lat)] : undefined
        }
      : user?.location;

    if (!targetInput) {
      return res.status(400).json({
        success: false,
        message: 'Location required (city, district, or coordinates)'
      });
    }

    const resolvedLocation = await resolveLocation(targetInput);
    const parsedRadius = Math.min(Math.max(parseInt(radius, 10) || 75, 5), 150);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 24);

    const nearbyResults = await findNearbyEntities({
      coordinates: resolvedLocation.coordinates,
      district: resolvedLocation.district,
      city: resolvedLocation.city,
      radiusKm: parsedRadius,
      interests: user?.interests || [],
      limit: parsedLimit
    });

    let selectedData = nearbyResults;
    if (category) {
      const cat = String(category).toLowerCase();
      if (cat === 'destinations' || cat === 'places') selectedData = { items: nearbyResults.nearbyDestinations };
      else if (cat === 'stays') selectedData = { items: nearbyResults.nearbyStays };
      else if (cat === 'rentals') selectedData = { items: nearbyResults.nearbyRentals };
      else if (cat === 'guides') selectedData = { items: nearbyResults.nearbyGuides };
      else if (cat === 'activities') selectedData = { items: nearbyResults.nearbyActivities };
      else if (cat === 'spiritual') selectedData = { items: nearbyResults.nearbySpiritual };
      else if (cat === 'culture') selectedData = { items: nearbyResults.nearbyCulture };
    }

    return res.status(200).json({
      success: true,
      userLocation: resolvedLocation,
      data: selectedData
    });
  } catch (error) {
    console.error('[GetPersonalizedNearby Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby records',
      error: error.message
    });
  }
};
