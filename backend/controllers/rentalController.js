import Rental from '../models/Rental.js';
import PartnerListing from '../models/PartnerListing.js';
import { createController } from './factoryController.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';

const rentalController = createController(Rental, false);

export const getRentals = async (req, res) => {
  try {
    const cacheKey = 'rentals:combined:all';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const staticRentals = await Rental.find({}).lean();
    
    // Fetch active partner rental listings
    const partnerListings = await PartnerListing.find({
      listingType: { $in: ['Rental', 'rental', 'Vehicle', 'vehicle', 'Bike', 'Car'] },
      status: { $in: ['ACTIVE', 'VERIFIED'] }
    }).lean();

    const normalizedPartnerRentals = partnerListings.map(pl => ({
      _id: pl._id,
      id: pl._id,
      name: pl.title,
      title: pl.title,
      category: pl.category || 'Vehicle Rental',
      type: pl.category || 'Motorcycle',
      district: pl.district,
      city: pl.city || pl.district,
      location: pl.location || (pl.city ? `${pl.city}, ${pl.district}` : pl.district),
      latitude: pl.location?.coordinates?.[1] || null,
      longitude: pl.location?.coordinates?.[0] || null,
      coordinates: pl.location?.coordinates ? [pl.location.coordinates[1], pl.location.coordinates[0]] : null,
      pricePerDay: pl.pricing?.amount || 1200,
      price: { amount: pl.pricing?.amount || 1200, currency: 'INR' },
      images: pl.images && pl.images.length > 0 ? pl.images : [{ url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80' }],
      image: pl.images && pl.images[0] ? (pl.images[0].url || pl.images[0]) : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      specifications: pl.specifications || {},
      vehicles: [{
        name: pl.title,
        type: pl.category || 'Vehicle',
        pricePerDay: pl.pricing?.amount || 1200
      }],
      isPartnerListing: true,
      partnerListingId: pl._id,
      rating: 4.9,
      reviewsCount: 18
    }));

    const combined = [...normalizedPartnerRentals, ...staticRentals];
    const responsePayload = { success: true, count: combined.length, data: combined };

    await cacheSet(cacheKey, responsePayload, 600);
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRentalBySlug = rentalController.getBySlug;
export const createRental = async (req, res) => {
  await cacheDelPattern('rentals:*');
  return rentalController.create(req, res);
};
export const updateRental = async (req, res) => {
  await cacheDelPattern('rentals:*');
  return rentalController.update(req, res);
};
export const deleteRental = async (req, res) => {
  await cacheDelPattern('rentals:*');
  return rentalController.remove(req, res);
};

