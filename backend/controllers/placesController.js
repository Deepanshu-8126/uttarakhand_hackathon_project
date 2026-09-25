import googlePlacesService from '../services/googlePlacesService.js';

/**
 * @desc   Search places on Google Places API
 * @route  GET /api/places/search
 * @access Public
 */
export const searchPlaces = async (req, res, next) => {
  try {
    const { query, q, lat, lng, radius } = req.query;
    const searchQuery = query || q;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const clean = searchQuery.trim();
    const cleanLower = clean.toLowerCase();

    // ─── STEP 1: Search local DB (106 verified destinations) ───
    let verified = [];
    try {
      const Destination = (await import('../models/Destination.js')).default;
      const dbDocs = await Destination.find({
        $or: [
          { name: { $regex: clean, $options: 'i' } },
          { district: { $regex: clean, $options: 'i' } },
          { region: { $regex: clean, $options: 'i' } },
          { highlights: { $regex: clean, $options: 'i' } }
        ]
      }).limit(5).select('name slug district region description coverImage images rating startingPrice latitude longitude location');

      verified = dbDocs.map(d => ({
        place_id: d._id.toString(),
        slug: d.slug,
        name: d.name,
        category: 'Verified Destination',
        type: 'destination',
        isVerified: true,
        pinColor: 'green',
        address: `${d.district || 'Uttarakhand'}, India`,
        district: d.district,
        location: {
          lat: d.latitude || d.location?.coordinates?.[1] || 30.0667,
          lng: d.longitude || d.location?.coordinates?.[0] || 79.0193
        },
        rating: d.rating || 4.8,
        price: d.startingPrice ? `₹${d.startingPrice}` : 'Free entry',
        image: d.coverImage?.url || (Array.isArray(d.images) && d.images[0]?.url) || 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=800&q=80',
        description: d.description?.slice(0, 160) || ''
      }));
    } catch (dbErr) {
      console.warn('[PlacesSearch] DB query fallback:', dbErr.message);
    }

    // ─── STEP 2: Call OSM Nominatim FREE API for real map data ───
    let aiDiscoveries = [];
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&format=json&limit=5&addressdetails=1`;
      const osmRes = await fetch(osmUrl, {
        headers: {
          'User-Agent': 'DiscoveryUttarakhandApp/1.0 (info@discoveryuttarakhand.org)',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (Array.isArray(osmData) && osmData.length > 0) {
          aiDiscoveries = osmData.map((item, idx) => {
            const shortName = item.name || item.display_name.split(',')[0];
            const cleanAddress = item.display_name;
            return {
              place_id: `osm_${item.place_id || idx}`,
              name: shortName,
              displayName: cleanAddress,
              category: item.type ? item.type.replace('_', ' ') : 'Scenic Discovery',
              type: 'ai_discovery',
              isVerified: false,
              label: 'Unverified but found via Maps',
              pinColor: 'gray',
              address: cleanAddress,
              location: {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon)
              },
              rating: null,
              description: `Real location discovered via OpenStreetMap coordinates [${parseFloat(item.lat).toFixed(4)}, ${parseFloat(item.lon).toFixed(4)}].`,
              rewardCoins: 20
            };
          });
        }
      }
    } catch (osmErr) {
      console.warn('[PlacesSearch] OSM fetch error, falling back to places service:', osmErr.message);
      // Fallback to existing Geoapify service if OSM is slow
      try {
        const fallbackResults = await googlePlacesService.searchPlaces({ query: clean, location: null, radius: 50000 });
        aiDiscoveries = fallbackResults.slice(0, 4).map(p => ({
          ...p,
          isVerified: false,
          label: 'Unverified but found via Maps',
          pinColor: 'gray',
          rewardCoins: 20
        }));
      } catch (fbErr) {
        // Safe silence
      }
    }

    const allData = [...verified, ...aiDiscoveries];

    return res.status(200).json({
      success: true,
      query: clean,
      count: allData.length,
      verifiedCount: verified.length,
      aiDiscoveriesCount: aiDiscoveries.length,
      verified,
      aiDiscoveries,
      data: allData
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

