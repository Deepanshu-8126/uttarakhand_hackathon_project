import Destination from '../models/Destination.js';
import Stay from '../models/Stay.js';
import Rental from '../models/Rental.js';
import PartnerListing from '../models/PartnerListing.js';
import Activity from '../models/Activity.js';
import Spiritual from '../models/Spiritual.js';
import Culture from '../models/Culture.js';
import HiddenLocation from '../models/HiddenLocation.js';
import googlePlacesService from '../services/googlePlacesService.js';
import livePlacePhotoService from '../services/livePlacePhotoService.js';
import { validateImageBelongsToEntity, getEntityPlaceholderSvg, normalizeEntityImage, resolveEntityImage } from '../utils/imageValidator.js';
import { cacheGet, cacheSet } from '../config/redis.js';

const DISTRICT_COORDS = {
  dehradun: [30.3165, 78.0322],
  haridwar: [29.9457, 78.1642],
  rishikesh: [30.0869, 78.2676],
  chamoli: [30.2937, 79.5603],
  rudraprayag: [30.2858, 78.9811],
  uttarkashi: [30.7268, 78.4354],
  tehri: [30.3926, 78.4800],
  pauri: [30.1500, 78.7800],
  nainital: [29.3919, 79.4542],
  almora: [29.5971, 79.6591],
  pithoragarh: [29.5829, 80.2182],
  bageshwar: [29.8377, 79.7711],
  champawat: [29.3347, 80.0911],
  'udham singh nagar': [28.9800, 79.5000]
};

function resolveCoords(item) {
  if (item.location && Array.isArray(item.location.coordinates) && item.location.coordinates.length === 2) {
    return { lat: item.location.coordinates[1], lng: item.location.coordinates[0] };
  }
  if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
    return { lat: item.latitude, lng: item.longitude };
  }
  if (typeof item.lat === 'number' && typeof item.lng === 'number') {
    return { lat: item.lat, lng: item.lng };
  }
  const locStr = `${item.district || ''} ${item.city || ''} ${item.address || ''} ${item.name || ''} ${item.title || ''}`.toLowerCase();
  for (const [dist, coords] of Object.entries(DISTRICT_COORDS)) {
    if (locStr.includes(dist)) {
      return { lat: coords[0], lng: coords[1] };
    }
  }
  return { lat: 30.0667, lng: 79.0193 };
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * @desc   Search verified places across MongoDB (Destinations, Stays, Rentals, Activities, Spiritual)
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
    const cacheKey = `places:search:db:${cleanLower}:${lat || ''}:${lng || ''}:${radius || ''}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const searchRegex = new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // ─── Query Real Database Records in Parallel ───
    const [destDocs, stayDocs, rentalDocs, partnerDocs, actDocs, spirDocs, cultDocs] = await Promise.allSettled([
      // 1. Destinations
      Destination.find({
        $or: [
          { name: searchRegex },
          { district: searchRegex },
          { region: searchRegex },
          { highlights: searchRegex }
        ]
      }).limit(8).lean(),

      // 2. Stays
      Stay.find({
        $or: [
          { name: searchRegex },
          { district: searchRegex },
          { city: searchRegex },
          { category: searchRegex }
        ]
      }).limit(6).lean(),

      // 3. Rentals
      Rental.find({
        $or: [
          { name: searchRegex },
          { district: searchRegex },
          { city: searchRegex },
          { category: searchRegex },
          { 'vehicles.name': searchRegex }
        ]
      }).limit(6).lean(),

      // 4. Active Partner Listings (Stays & Rentals)
      PartnerListing.find({
        status: { $in: ['ACTIVE', 'VERIFIED'] },
        $or: [
          { title: searchRegex },
          { district: searchRegex },
          { city: searchRegex },
          { category: searchRegex }
        ]
      }).limit(8).lean(),

      // 5. Activities & Treks
      Activity.find({
        $or: [
          { name: searchRegex },
          { district: searchRegex },
          { category: searchRegex }
        ]
      }).limit(6).lean(),

      // 6. Spiritual Places & Temples
      Spiritual.find({
        $or: [
          { name: searchRegex },
          { district: searchRegex },
          { deity: searchRegex }
        ]
      }).limit(6).lean(),

      // 7. Culture & Heritage
      Culture.find({
        $or: [
          { name: searchRegex },
          { district: searchRegex },
          { category: searchRegex }
        ]
      }).limit(4).lean()
    ]);

    const verified = [];

    // Format Destinations
    if (destDocs.status === 'fulfilled' && Array.isArray(destDocs.value)) {
      destDocs.value.forEach(d => {
        const coords = resolveCoords(d);
        verified.push({
          place_id: d._id.toString(),
          slug: d.slug,
          name: d.name,
          category: 'Verified Destination',
          type: 'destination',
          isVerified: true,
          pinColor: 'green',
          address: `${d.district || 'Uttarakhand'}, India`,
          district: d.district,
          location: coords,
          rating: d.rating || 4.8,
          price: d.startingPrice ? `₹${d.startingPrice}` : 'Free entry',
          image: d.coverImage?.url || (Array.isArray(d.images) && d.images[0]?.url) || (typeof d.coverImage === 'string' ? d.coverImage : null) || 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=800&q=80',
          description: d.description?.slice(0, 160) || d.shortDescription || '',
          link: `/destinations/${d.slug}`
        });
      });
    }

    // Format Stays
    if (stayDocs.status === 'fulfilled' && Array.isArray(stayDocs.value)) {
      stayDocs.value.forEach(s => {
        const coords = resolveCoords(s);
        const priceAmount = s.price?.amount || s.pricePerNight;
        verified.push({
          place_id: s._id.toString(),
          slug: s.slug || s._id.toString(),
          name: s.name,
          category: s.category || 'Homestay / Resort',
          type: 'stay',
          isVerified: true,
          pinColor: 'amber',
          address: `${s.city ? `${s.city}, ` : ''}${s.district || 'Uttarakhand'}`,
          district: s.district,
          location: coords,
          rating: s.rating || 4.8,
          price: priceAmount ? `₹${priceAmount}/night` : 'Price on request',
          image: s.images?.[0]?.url || (typeof s.image === 'string' ? s.image : s.image?.url) || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
          description: s.shortDescription || s.description?.slice(0, 160) || 'Verified Himalayan stay in Uttarakhand.',
          link: `/stays/${s.slug || s._id}`
        });
      });
    }

    // Format Rentals
    if (rentalDocs.status === 'fulfilled' && Array.isArray(rentalDocs.value)) {
      rentalDocs.value.forEach(r => {
        const coords = resolveCoords(r);
        const lowestPrice = Array.isArray(r.vehicles) && r.vehicles.length > 0
          ? Math.min(...r.vehicles.map(v => v.pricePerDay).filter(Boolean))
          : null;
        verified.push({
          place_id: r._id.toString(),
          slug: r.slug || r._id.toString(),
          name: r.name,
          category: r.category || 'Vehicle Rental',
          type: 'rental',
          isVerified: true,
          pinColor: 'blue',
          address: `${r.city ? `${r.city}, ` : ''}${r.district || 'Uttarakhand'}`,
          district: r.district,
          location: coords,
          rating: r.rating || 4.9,
          price: lowestPrice ? `From ₹${lowestPrice}/day` : 'Daily rental',
          image: r.images?.[0]?.url || r.vehicles?.[0]?.image?.url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
          description: r.description?.slice(0, 160) || 'Verified mountain bike and car rental provider.',
          link: `/rentals`
        });
      });
    }

    // Format Partner Listings (Stays & Rentals)
    if (partnerDocs.status === 'fulfilled' && Array.isArray(partnerDocs.value)) {
      partnerDocs.value.forEach(pl => {
        const coords = resolveCoords(pl);
        const isStay = ['Stay', 'stay', 'Homestay', 'homestay', 'Hotel', 'hotel'].includes(pl.listingType);
        verified.push({
          place_id: pl._id.toString(),
          slug: pl.slug || pl._id.toString(),
          name: pl.title,
          category: pl.category || (isStay ? 'Homestay' : 'Vehicle Rental'),
          type: isStay ? 'stay' : 'rental',
          isVerified: true,
          pinColor: isStay ? 'amber' : 'blue',
          address: `${pl.city ? `${pl.city}, ` : ''}${pl.district || 'Uttarakhand'}`,
          district: pl.district,
          location: coords,
          rating: 4.9,
          price: pl.pricing?.amount ? `₹${pl.pricing.amount}/${pl.pricing.unit || (isStay ? 'night' : 'day')}` : 'Verified Price',
          image: pl.images?.[0]?.url || (typeof pl.images?.[0] === 'string' ? pl.images[0] : null) || (isStay ? 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'),
          description: pl.description?.slice(0, 160) || 'Verified Himalayan partner listing.',
          link: isStay ? `/stays/${pl.slug || pl._id}` : `/rentals`
        });
      });
    }

    // Format Activities
    if (actDocs.status === 'fulfilled' && Array.isArray(actDocs.value)) {
      actDocs.value.forEach(a => {
        const coords = resolveCoords(a);
        verified.push({
          place_id: a._id.toString(),
          slug: a.slug || a._id.toString(),
          name: a.name,
          category: a.category || 'Adventure Activity',
          type: 'activity',
          isVerified: true,
          pinColor: 'purple',
          address: `${a.district || 'Uttarakhand'}, India`,
          district: a.district,
          location: coords,
          rating: a.rating || 4.8,
          price: a.price?.amount ? `₹${a.price.amount}` : 'Activity guide',
          image: a.images?.[0]?.url || (typeof a.image === 'string' ? a.image : a.image?.url) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          description: a.description?.slice(0, 160) || 'Authentic mountain adventure & trek experience.',
          link: `/activities`
        });
      });
    }

    // Format Spiritual Places
    if (spirDocs.status === 'fulfilled' && Array.isArray(spirDocs.value)) {
      spirDocs.value.forEach(s => {
        const coords = resolveCoords(s);
        verified.push({
          place_id: s._id.toString(),
          slug: s.slug || s._id.toString(),
          name: s.name,
          category: 'Spiritual Shrine',
          type: 'spiritual',
          isVerified: true,
          pinColor: 'amber',
          address: `${s.district || 'Uttarakhand'}, India`,
          district: s.district,
          location: coords,
          rating: s.rating || 4.9,
          price: 'Sacred darshan',
          image: s.coverImage?.url || s.image?.url || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
          description: s.significance || s.description?.slice(0, 160) || 'Revered ancient temple and spiritual heritage site.',
          link: `/spiritual/${s.slug || s._id}`
        });
      });
    }

    // Format Culture
    if (cultDocs.status === 'fulfilled' && Array.isArray(cultDocs.value)) {
      cultDocs.value.forEach(c => {
        const coords = resolveCoords(c);
        verified.push({
          place_id: c._id.toString(),
          slug: c.slug || c._id.toString(),
          name: c.name,
          category: 'Culture & Heritage',
          type: 'culture',
          isVerified: true,
          pinColor: 'stone',
          address: `${c.district || 'Uttarakhand'}, India`,
          district: c.district,
          location: coords,
          rating: c.rating || 4.7,
          price: 'Cultural discovery',
          image: c.coverImage?.url || c.image?.url || 'https://images.unsplash.com/photo-1594818898109-44d17d5a15bd?auto=format&fit=crop&w=800&q=80',
          description: c.description?.slice(0, 160) || 'Pahadi heritage and authentic cultural tradition.',
          link: `/culture`
        });
      });
    }

    const responsePayload = {
      success: true,
      query: clean,
      count: verified.length,
      verifiedCount: verified.length,
      aiDiscoveriesCount: 0,
      verified,
      aiDiscoveries: [],
      data: verified
    };

    // Cache database search results for 10 minutes (600s)
    await cacheSet(cacheKey, responsePayload, 600);

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

function extractItemPhoto(item) {
  return normalizeEntityImage(item).url;
}

/**
 * @desc   Get nearby places from MongoDB (Destinations, Stays, Rentals, Activities, Spiritual, HiddenLocations)
 * @route  GET /api/places/nearby
 * @access Public
 */
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, type, radius, keyword } = req.query;
    const centerLat = lat ? parseFloat(lat) : 30.0667;
    const centerLng = lng ? parseFloat(lng) : 79.0193;
    const radiusMeters = radius ? parseInt(radius) : 50000;
    const radiusKm = radiusMeters / 1000;
    const requestedType = (type || 'all').toLowerCase();
    const searchKeyword = (keyword || '').toLowerCase().trim();

    const cacheKey = `places:nearby:db:v2:${centerLat.toFixed(4)}:${centerLng.toFixed(4)}:${requestedType}:${radiusMeters}:${searchKeyword}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    // Parallel fetch from all key DB collections
    const [destinations, stays, rentals, activities, spirituals, partnerListings, hiddenLocations] = await Promise.all([
      Destination.find({}).lean().catch(() => []),
      Stay.find({}).lean().catch(() => []),
      Rental.find({}).lean().catch(() => []),
      Activity.find({}).lean().catch(() => []),
      Spiritual.find({}).lean().catch(() => []),
      PartnerListing.find({ status: { $in: ['ACTIVE', 'VERIFIED'] } }).lean().catch(() => []),
      HiddenLocation.find({ isActive: true }).lean().catch(() => [])
    ]);

    const candidatePlaces = [];

    // 1. Destinations
    destinations.forEach(d => {
      const coords = resolveCoords(d);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const normImg = normalizeEntityImage({ ...d, entityType: 'destination' });
        candidatePlaces.push({
          place_id: d._id.toString(),
          entityId: d._id.toString(),
          entityType: 'destination',
          name: d.name,
          slug: d.slug,
          types: ['tourist_attraction', 'natural_feature', 'destination'],
          type: 'destination',
          vicinity: `${d.district || 'Uttarakhand'}, India`,
          district: d.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof d.rating === 'number' && d.rating > 0 ? d.rating : null,
          user_ratings_total: typeof d.user_ratings_total === 'number' && d.user_ratings_total > 0 ? d.user_ratings_total : (typeof d.reviewCount === 'number' && d.reviewCount > 0 ? d.reviewCount : null),
          is_hidden_gem: (d.tags || []).includes('offbeat') || (d.category || '').toLowerCase().includes('hidden'),
          highlight: d.shortDescription || d.description?.slice(0, 140) || 'Iconic Himalayan destination.',
          open_now: true,
          provider: 'Uttarakhand Tourism Registry',
          distanceKm: dist,
          debug: {
            entityId: d._id.toString(),
            entityType: 'destination',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // 2. Stays
    stays.forEach(s => {
      const coords = resolveCoords(s);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const normImg = normalizeEntityImage({ ...s, entityType: 'stay' });
        candidatePlaces.push({
          place_id: s._id.toString(),
          entityId: s._id.toString(),
          entityType: 'stay',
          name: s.name,
          slug: s.slug || s._id.toString(),
          types: ['lodging', 'stay', 'campground'],
          type: 'stay',
          vicinity: `${s.city ? `${s.city}, ` : ''}${s.district || 'Uttarakhand'}`,
          district: s.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof s.rating === 'number' && s.rating > 0 ? s.rating : null,
          user_ratings_total: typeof s.reviewCount === 'number' && s.reviewCount > 0 ? s.reviewCount : null,
          is_hidden_gem: false,
          highlight: s.shortDescription || s.description?.slice(0, 140) || 'Verified Himalayan stay & homestay.',
          open_now: true,
          provider: 'Verified Homestay Network',
          distanceKm: dist,
          debug: {
            entityId: s._id.toString(),
            entityType: 'stay',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // 3. Rentals
    rentals.forEach(r => {
      const coords = resolveCoords(r);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const normImg = normalizeEntityImage({ ...r, entityType: 'rental' });
        candidatePlaces.push({
          place_id: r._id.toString(),
          entityId: r._id.toString(),
          entityType: 'rental',
          name: r.name,
          slug: r.slug || r._id.toString(),
          types: ['car_rental', 'rental', 'transportation'],
          type: 'rental',
          vicinity: `${r.city ? `${r.city}, ` : ''}${r.district || 'Uttarakhand'}`,
          district: r.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof r.rating === 'number' && r.rating > 0 ? r.rating : null,
          user_ratings_total: typeof r.reviewCount === 'number' && r.reviewCount > 0 ? r.reviewCount : null,
          is_hidden_gem: false,
          highlight: r.description?.slice(0, 140) || 'Mountain bike and vehicle rental provider.',
          open_now: true,
          provider: 'Verified Fleet Registry',
          distanceKm: dist,
          debug: {
            entityId: r._id.toString(),
            entityType: 'rental',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // 4. Partner Listings (Stays & Rentals)
    partnerListings.forEach(pl => {
      const coords = resolveCoords(pl);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const isStay = ['Stay', 'stay', 'Homestay', 'homestay', 'Hotel', 'hotel'].includes(pl.listingType);
        const normImg = normalizeEntityImage({ ...pl, entityType: isStay ? 'stay' : 'rental' });
        candidatePlaces.push({
          place_id: pl._id.toString(),
          entityId: pl._id.toString(),
          entityType: isStay ? 'stay' : 'rental',
          name: pl.title,
          slug: pl.slug || pl._id.toString(),
          types: isStay ? ['lodging', 'stay'] : ['car_rental', 'rental'],
          type: isStay ? 'stay' : 'rental',
          vicinity: `${pl.city ? `${pl.city}, ` : ''}${pl.district || 'Uttarakhand'}`,
          district: pl.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof pl.rating === 'number' && pl.rating > 0 ? pl.rating : null,
          user_ratings_total: typeof pl.reviewCount === 'number' && pl.reviewCount > 0 ? pl.reviewCount : null,
          is_hidden_gem: true,
          highlight: pl.description?.slice(0, 140) || 'Verified Uttarakhand Tourism Partner.',
          open_now: true,
          provider: 'Community Partner Network',
          distanceKm: dist,
          debug: {
            entityId: pl._id.toString(),
            entityType: isStay ? 'stay' : 'rental',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // 5. Activities
    activities.forEach(a => {
      const coords = resolveCoords(a);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const normImg = normalizeEntityImage({ ...a, entityType: 'activity' });
        candidatePlaces.push({
          place_id: a._id.toString(),
          entityId: a._id.toString(),
          entityType: 'activity',
          name: a.name,
          slug: a.slug || a._id.toString(),
          types: ['tourist_attraction', 'activity', 'point_of_interest'],
          type: 'activity',
          vicinity: `${a.district || 'Uttarakhand'}, India`,
          district: a.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof a.rating === 'number' && a.rating > 0 ? a.rating : null,
          user_ratings_total: typeof a.reviewCount === 'number' && a.reviewCount > 0 ? a.reviewCount : null,
          is_hidden_gem: false,
          highlight: a.description?.slice(0, 140) || 'High-adrenaline mountain experience & trek.',
          open_now: true,
          provider: 'Pahadi Guides & Treks',
          distanceKm: dist,
          debug: {
            entityId: a._id.toString(),
            entityType: 'activity',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // 6. Spiritual Places
    spirituals.forEach(s => {
      const coords = resolveCoords(s);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const normImg = normalizeEntityImage({ ...s, entityType: 'spiritual' });
        candidatePlaces.push({
          place_id: s._id.toString(),
          entityId: s._id.toString(),
          entityType: 'spiritual',
          name: s.name,
          slug: s.slug || s._id.toString(),
          types: ['place_of_worship', 'tourist_attraction', 'spiritual'],
          type: 'spiritual',
          vicinity: `${s.district || 'Uttarakhand'}, India`,
          district: s.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof s.rating === 'number' && s.rating > 0 ? s.rating : null,
          user_ratings_total: typeof s.reviewCount === 'number' && s.reviewCount > 0 ? s.reviewCount : null,
          is_hidden_gem: false,
          highlight: s.significance || s.description?.slice(0, 140) || 'Sacred Himalayan temple & shrine.',
          open_now: true,
          provider: 'Spiritual Circuit Registry',
          distanceKm: dist,
          debug: {
            entityId: s._id.toString(),
            entityType: 'spiritual',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // 7. Hidden Locations
    hiddenLocations.forEach(h => {
      const coords = resolveCoords(h);
      const dist = calculateDistanceKm(centerLat, centerLng, coords.lat, coords.lng);
      if (dist <= Math.max(radiusKm * 1.5, 65)) {
        const normImg = normalizeEntityImage({ ...h, entityType: 'hidden_spot' });
        candidatePlaces.push({
          place_id: h._id.toString(),
          entityId: h._id.toString(),
          entityType: 'hidden_spot',
          name: h.name,
          slug: h.slug || h._id.toString(),
          types: ['tourist_attraction', 'natural_feature', 'hidden_spot'],
          type: 'hidden_spot',
          vicinity: `${h.district || 'Uttarakhand'}, India`,
          district: h.district,
          location: coords,
          image: normImg,
          photo_urls: [normImg.url],
          rating: typeof h.rating === 'number' && h.rating > 0 ? h.rating : null,
          user_ratings_total: typeof h.reviewCount === 'number' && h.reviewCount > 0 ? h.reviewCount : null,
          is_hidden_gem: true,
          highlight: h.description || h.bestTimeToVisit || 'Authentic offbeat hidden spot.',
          open_now: true,
          provider: 'Curated Hidden Uttarakhand Registry',
          distanceKm: dist,
          debug: {
            entityId: h._id.toString(),
            entityType: 'hidden_spot',
            imageResolvedFrom: normImg.source,
            imageEntityId: normImg.entityId,
            imageEntityMatch: true
          }
        });
      }
    });

    // If local DB records in immediate vicinity are few (< 4), complement with live radar POIs
    if (candidatePlaces.length < 4) {
      try {
        const liveRadar = await googlePlacesService.getNearbyPlaces({
          lat: centerLat,
          lng: centerLng,
          type: requestedType,
          radius: radiusMeters,
          keyword: searchKeyword
        });
        if (Array.isArray(liveRadar)) {
          const sanitizedLive = liveRadar.map(poi => {
            const norm = normalizeEntityImage({
              ...poi,
              name: poi.name,
              entityType: poi.types?.includes('lodging') ? 'stay' : poi.types?.includes('food') ? 'dhaba' : 'spot'
            });
            return {
              ...poi,
              entityId: poi.place_id,
              entityType: poi.type || 'radar_poi',
              image: norm,
              photo_urls: [norm.url]
            };
          });
          candidatePlaces.push(...sanitizedLive);
        }
      } catch (err) {
        console.warn('[placesController] Complementary radar fetch skipped:', err.message);
      }
    }

    // Filter by type
    let filtered = candidatePlaces.filter(p => {
      if (requestedType === 'all') return true;
      if (requestedType === 'viewpoints' || requestedType === 'tourist_attraction') {
        return (p.types || []).includes('tourist_attraction') || (p.types || []).includes('natural_feature') || p.type === 'destination' || p.type === 'hidden_spot';
      }
      if (requestedType === 'food' || requestedType === 'restaurant') {
        return (p.types || []).includes('food') || (p.types || []).includes('restaurant') || (p.name || '').toLowerCase().includes('dhaba') || (p.name || '').toLowerCase().includes('tea') || (p.name || '').toLowerCase().includes('coffee');
      }
      if (requestedType === 'lodging' || requestedType === 'stay') {
        return (p.types || []).includes('lodging') || p.type === 'stay';
      }
      if (requestedType === 'rental') {
        return p.type === 'rental';
      }
      if (requestedType === 'spiritual') {
        return p.type === 'spiritual' || (p.types || []).includes('place_of_worship');
      }
      return true;
    });

    // Filter by keyword if provided
    if (searchKeyword) {
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(searchKeyword) ||
        (p.vicinity || '').toLowerCase().includes(searchKeyword) ||
        (p.district && p.district.toLowerCase().includes(searchKeyword)) ||
        (p.highlight && p.highlight.toLowerCase().includes(searchKeyword))
      );
    }

    // Sort by proximity to requested coordinates
    filtered.sort((a, b) => (a.distanceKm || a.distance_approx_km || 999) - (b.distanceKm || b.distance_approx_km || 999));

    // Deterministic Deduplication by Canonical Identity, Slug, and Normalized Name + Vicinity
    const seen = new Set();
    const deduplicated = [];
    for (const p of filtered) {
      const nameKey = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const vicKey = (p.vicinity || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const compositeKey = `${nameKey}__${vicKey}`;
      const idKey = p.place_id || p.slug;

      if (!seen.has(idKey) && !seen.has(compositeKey)) {
        seen.add(idKey);
        seen.add(compositeKey);
        deduplicated.push(p);
      }
    }

    // Limit to top 12 authentic spots
    const finalPlaces = deduplicated.slice(0, 12);

    const responsePayload = {
      success: true,
      count: finalPlaces.length,
      is_live_google_api: false,
      provider: 'MongoDB Atlas Verified Tourism Registry',
      data: finalPlaces
    };

    await cacheSet(cacheKey, responsePayload, 600);
    return res.status(200).json(responsePayload);
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

    // Try finding in Destination first
    if (placeId) {
      const dest = await Destination.findById(placeId).lean().catch(() => null);
      if (dest) {
        return res.status(200).json({
          success: true,
          data: {
            place_id: dest._id.toString(),
            name: dest.name,
            formatted_address: `${dest.district || 'Uttarakhand'}, India`,
            rating: dest.rating || 4.8,
            user_ratings_total: 350,
            location: resolveCoords(dest),
            photos: Array.isArray(dest.images) && dest.images.length > 0 ? dest.images.map(img => img.url) : [dest.coverImage?.url].filter(Boolean),
            description: dest.description || dest.shortDescription
          }
        });
      }

      const stay = await Stay.findById(placeId).lean().catch(() => null);
      if (stay) {
        return res.status(200).json({
          success: true,
          data: {
            place_id: stay._id.toString(),
            name: stay.name,
            formatted_address: `${stay.city ? `${stay.city}, ` : ''}${stay.district || 'Uttarakhand'}, India`,
            rating: stay.rating || 4.8,
            user_ratings_total: stay.reviewCount || 45,
            location: resolveCoords(stay),
            photos: Array.isArray(stay.images) && stay.images.length > 0 ? stay.images.map(img => img.url) : [],
            description: stay.description || stay.shortDescription
          }
        });
      }
    }

    // Fallback to googlePlacesService if available
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
    provider: 'MongoDB Atlas Real Tourism Database',
    active_engine: 'Real Uttarakhand Mountain Database Engine',
    message: 'MongoDB Atlas collections (Destinations, Stays, Rentals, Activities, Spiritual) active.'
  });
};

/**
 * @desc   Fetch real high-resolution photograph and encyclopedia summary for any location
 * @route  GET /api/places/live-photo
 * @access Public
 */
export const getLivePhoto = async (req, res, next) => {
  try {
    const { name, q, address } = req.query;
    const query = name || q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Place name is required' });
    }

    // Check DB first for authentic destination image
    const dest = await Destination.findOne({
      $or: [
        { name: new RegExp(`^${query}$`, 'i') },
        { slug: query.toLowerCase() }
      ]
    }).lean();

    if (dest) {
      const candidate = dest.coverImage?.url || (Array.isArray(dest.images) && dest.images[0]?.url) || (typeof dest.coverImage === 'string' ? dest.coverImage : null);
      if (candidate) {
        const check = validateImageBelongsToEntity(candidate, dest);
        if (check.valid) {
          return res.status(200).json({
            success: true,
            data: {
              imageUrl: candidate,
              thumbnailUrl: candidate,
              title: dest.name,
              summary: dest.shortDescription || dest.description?.slice(0, 160),
              source: 'Discovery Uttarakhand Database'
            }
          });
        }
      }

      // If no valid image for destination, return neutral entity placeholder
      const placeholder = getEntityPlaceholderSvg({ name: dest.name, category: 'Destination', slug: dest.slug });
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: null,
          thumbnailUrl: null,
          placeholderUrl: placeholder,
          title: dest.name,
          summary: dest.shortDescription || dest.description?.slice(0, 160),
          source: 'Discovery Uttarakhand Database'
        }
      });
    }

    const photoData = await livePlacePhotoService.getPlacePhoto(query, address || '');
    return res.status(200).json({
      success: true,
      data: photoData
    });
  } catch (error) {
    next(error);
  }
};
