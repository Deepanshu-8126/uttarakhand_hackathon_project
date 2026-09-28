import Stay from '../models/Stay.js';
import PartnerListing from '../models/PartnerListing.js';
import { createController } from './factoryController.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';

const stayController = createController(Stay, false);

export const getStays = async (req, res) => {
  try {
    const cacheKey = 'stays:combined:all';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const staticStays = await Stay.find({}).lean();
    
    // Fetch active partner stay listings
    const partnerListings = await PartnerListing.find({
      listingType: { $in: ['Stay', 'stay', 'Homestay', 'homestay', 'Hotel', 'hotel'] },
      status: { $in: ['ACTIVE', 'VERIFIED'] }
    }).lean();

    const normalizedPartnerStays = partnerListings.map(pl => ({
      _id: pl._id,
      id: pl._id,
      name: pl.title,
      title: pl.title,
      category: pl.category || 'Homestay Host Listing',
      type: pl.category || 'Homestay',
      district: pl.district,
      city: pl.city || pl.district,
      displayLocation: pl.city ? `${pl.city}, ${pl.district}` : pl.district,
      location: pl.location || (pl.city ? `${pl.city}, ${pl.district}` : pl.district),
      latitude: pl.location?.coordinates?.[1] || null,
      longitude: pl.location?.coordinates?.[0] || null,
      coordinates: pl.location?.coordinates ? [pl.location.coordinates[1], pl.location.coordinates[0]] : null,
      price: { amount: pl.pricing?.amount || 1500, currency: 'INR' },
      pricePerNight: pl.pricing?.amount || 1500,
      images: pl.images && pl.images.length > 0 ? pl.images : [{ url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80' }],
      image: pl.images && pl.images[0] ? (pl.images[0].url || pl.images[0]) : 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      amenities: pl.amenities || ['Wifi', 'Mountain View', 'Hot Water', 'Home Cooked Meals'],
      facilities: pl.amenities || [],
      isPartnerListing: true,
      partnerListingId: pl._id,
      rating: 4.9,
      reviewsCount: 14
    }));

    const combined = [...normalizedPartnerStays, ...staticStays];
    const responsePayload = { success: true, count: combined.length, data: combined };
    
    await cacheSet(cacheKey, responsePayload, 600);
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStayBySlug = stayController.getBySlug;
export const createStay = async (req, res) => {
  await cacheDelPattern('stays:*');
  return stayController.create(req, res);
};
export const updateStay = async (req, res) => {
  await cacheDelPattern('stays:*');
  return stayController.update(req, res);
};
export const deleteStay = async (req, res) => {
  await cacheDelPattern('stays:*');
  return stayController.remove(req, res);
};

