import googlePlacesService from '../services/googlePlacesService.js';

/**
 * @desc   Search places on Google Places API
 * @route  GET /api/places/search
 * @access Public
 */
export const searchPlaces = async (req, res, next) => {
  try {
    const { query, lat, lng, radius } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const location = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
    const places = await googlePlacesService.searchPlaces({
      query,
      location,
      radius: radius ? parseInt(radius) : 50000
    });

    return res.status(200).json({
      success: true,
      count: places.length,
      is_live_google_api: googlePlacesService.hasApiKey(),
      data: places
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get nearby places (dhabas, hidden spots, camps, viewpoints)
 * @route  GET /api/places/nearby
 * @access Public
 */
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, type, radius, keyword } = req.query;

    const places = await googlePlacesService.getNearbyPlaces({
      lat: lat ? parseFloat(lat) : 30.0667,
      lng: lng ? parseFloat(lng) : 79.0193,
      type: type || 'all',
      radius: radius ? parseInt(radius) : 15000,
      keyword: keyword || ''
    });

    return res.status(200).json({
      success: true,
      count: places.length,
      is_live_google_api: googlePlacesService.hasApiKey(),
      data: places
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get place details (photos, live reviews, opening hours)
 * @route  GET /api/places/details
 * @access Public
 */
export const getPlaceDetails = async (req, res, next) => {
  try {
    const { placeId, name } = req.query;

    if (!placeId && !name) {
      return res.status(400).json({
        success: false,
        error: 'Either placeId or name is required'
      });
    }

    const details = await googlePlacesService.getPlaceDetails({
      placeId,
      placeName: name
    });

    return res.status(200).json({
      success: true,
      is_live_google_api: googlePlacesService.hasApiKey(),
      data: details
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get live route directions & turn-by-turn navigation between waypoints
 * @route  GET /api/places/route
 * @access Public
 */
export const getRouteDirections = async (req, res, next) => {
  try {
    const { fromLat, fromLng, toLat, toLng, mode } = req.query;
    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({
        success: false,
        error: 'fromLat, fromLng, toLat, toLng are all required'
      });
    }

    const route = await googlePlacesService.getRouteDirections({
      fromLat: parseFloat(fromLat),
      fromLng: parseFloat(fromLng),
      toLat: parseFloat(toLat),
      toLng: parseFloat(toLng),
      mode: mode || 'drive'
    });

    return res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Places API integration status
 * @route  GET /api/places/status
 * @access Public
 */
export const getPlacesStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    has_api_key: googlePlacesService.hasApiKey(),
    provider: 'Geoapify Live Places & Routing v2',
    active_engine: 'Live Himalayan Radar Active',
    message: 'Geoapify live Places, POIs, Dhabas & Routing API connected and active.'
  });
};

