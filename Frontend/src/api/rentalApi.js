import api from './api';
import { getEntityPlaceholderSvg } from '../utils/imageHelpers';

export const getVehiclePlaceholder = (name = '', type = '') => {
  return getEntityPlaceholderSvg({ name: name || 'Rental Vehicle', category: type || 'Vehicle' });
};

export const getVehicleImage = (vehicle, fallback) => {
  if (!vehicle) return fallback || getVehiclePlaceholder();
  if (typeof vehicle === 'string') return vehicle;
  if (vehicle.image?.url) return vehicle.image.url;
  if (vehicle.coverImage?.url) return vehicle.coverImage.url;
  if (vehicle.image && typeof vehicle.image === 'string') return vehicle.image;
  return fallback || getVehiclePlaceholder(vehicle.name, vehicle.type);
};


export const getRentals = async (params = {}) => {
  const response = await api.get('/rentals', { params });
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    const flattened = [];
    response.data.data.forEach(biz => {
      const displayLocation = biz.displayLocation || `${biz.city || ''}${biz.city && biz.district ? ', ' : ''}${biz.district || 'Uttarakhand'}`;
      
      if (biz.vehicles && Array.isArray(biz.vehicles) && biz.vehicles.length > 0) {
        biz.vehicles.forEach((v, index) => {
          let rawUrl = v.image?.url || (typeof v.image === 'string' ? v.image : null);
          if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
            rawUrl = (biz.images && biz.images[0]?.url) || (biz.coverImage?.url) || getVehiclePlaceholder(v.name, v.type || biz.category);
          }

          const dailyPrice = v.pricePerDay || biz.pricePerDay || biz.price?.amount || null;

          flattened.push({
            ...biz,
            ...v,
            id: biz._id || biz.id,
            _id: biz._id || biz.id,
            compositeId: `${biz._id || biz.id}_${index}`,
            slug: biz.slug,
            name: v.name || biz.name,
            vehicleName: v.name,
            businessName: biz.businessName || biz.name,
            price: dailyPrice ? { amount: dailyPrice, currency: 'INR', unit: 'day', provenance: 'VERIFIED' } : { amount: null, provenance: 'UNKNOWN' },
            pricePerDay: dailyPrice,
            priceDisplay: dailyPrice ? `₹${dailyPrice.toLocaleString('en-IN')}/day` : 'Price not verified',
            type: v.type || biz.type || biz.category,
            category: v.category || biz.category || 'Vehicle Rental',
            city: biz.city,
            district: biz.district,
            location: displayLocation,
            displayLocation,
            available: true,
            coverImage: { url: rawUrl },
            image: rawUrl,
            images: [{ url: rawUrl }],
            rating: biz.rating || null,
            reviewsCount: biz.reviewsCount || 0,
            isVerified: biz.isVerified !== false,
            isPartnerListing: biz.isPartnerListing || false,
            partnerListingId: biz.partnerListingId || null
          });
        });
      } else {
        const rawUrl = (biz.images && biz.images[0]?.url) || biz.coverImage?.url || getVehiclePlaceholder(biz.name, biz.category);
        const dailyPrice = biz.pricePerDay || biz.price?.amount || null;

        flattened.push({
          ...biz,
          id: biz._id || biz.id,
          _id: biz._id || biz.id,
          compositeId: `${biz._id || biz.id}_0`,
          location: displayLocation,
          displayLocation,
          price: dailyPrice ? { amount: dailyPrice, currency: 'INR', unit: 'day', provenance: 'VERIFIED' } : { amount: null, provenance: 'UNKNOWN' },
          pricePerDay: dailyPrice,
          priceDisplay: dailyPrice ? `Starts ₹${dailyPrice.toLocaleString('en-IN')}/day` : 'Price not verified',
          coverImage: { url: rawUrl },
          image: rawUrl,
          images: [{ url: rawUrl }],
          rating: biz.rating || null,
          reviewsCount: biz.reviewsCount || 0,
          isVerified: biz.isVerified !== false
        });
      }
    });
    response.data.data = flattened;
    return response.data;
  }

  return {
    success: false,
    data: [],
    count: 0,
    message: response.data?.message || 'Failed to fetch verified rentals'
  };
};

export const getRentalById = async (id) => {
  const cleanId = String(id).split('_')[0];
  const response = await api.get(`/rentals/${cleanId}`);
  return response.data;
};

export const createRental = async (data) => {
  const response = await api.post('/rentals', data);
  return response.data;
};

export const updateRental = async (id, data) => {
  const response = await api.put(`/rentals/${id}`, data);
  return response.data;
};

export const deleteRental = async (id) => {
  const response = await api.delete(`/rentals/${id}`);
  return response.data;
};

export default {
  getRentals,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
  getVehiclePlaceholder
};
