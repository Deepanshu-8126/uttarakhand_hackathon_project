import Stay from '../models/Stay.js';
import PartnerListing from '../models/PartnerListing.js';
import { createController } from './factoryController.js';

const stayController = createController(Stay, false);

export const getStays = async (req, res) => {
  try {
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
      location: pl.city ? `${pl.city}, ${pl.district}` : pl.district,
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
    res.status(200).json({ success: true, count: combined.length, data: combined });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStayBySlug = stayController.getBySlug;
export const createStay = stayController.create;
export const updateStay = stayController.update;
export const deleteStay = stayController.remove;
