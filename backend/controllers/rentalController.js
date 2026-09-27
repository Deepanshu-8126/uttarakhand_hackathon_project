import Rental from '../models/Rental.js';
import PartnerListing from '../models/PartnerListing.js';
import { createController } from './factoryController.js';

const rentalController = createController(Rental, false);

export const getRentals = async (req, res) => {
  try {
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
      location: pl.city ? `${pl.city}, ${pl.district}` : pl.district,
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
    res.status(200).json({ success: true, count: combined.length, data: combined });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRentalBySlug = rentalController.getBySlug;
export const createRental = rentalController.create;
export const updateRental = rentalController.update;
export const deleteRental = rentalController.remove;
