import api from './api';
import { getEntityPlaceholderSvg } from '../utils/imageHelpers';

export const normalizeStay = (s) => {
  if (!s) return s;
  const isKmvn = s.name?.includes('KMVN') || s.category?.includes('Government') || s.category?.includes('Rest House') || s.category?.includes('Eco Camp');
  const city = s.city || s.district || 'Uttarakhand';
  const district = s.district || 'Uttarakhand';
  const displayLocation = s.displayLocation || s.location || (s.city ? `${s.city}${s.district ? `, ${s.district}` : ''}` : district);
  
  const rawImg = (Array.isArray(s.images) && s.images[0]?.url) ||
                 (Array.isArray(s.images) && typeof s.images[0] === 'string' ? s.images[0] : null) ||
                 s.coverImage?.url ||
                 (typeof s.coverImage === 'string' ? s.coverImage : null) ||
                 s.image?.url ||
                 (typeof s.image === 'string' ? s.image : null);

  const fallbackPlaceholder = getEntityPlaceholderSvg({ name: s.name, category: s.category || 'Stay' });
  const finalImg = rawImg || (isKmvn ? '/assets/kmvn-stay.svg' : fallbackPlaceholder);
  
  const priceVal = (s.price && typeof s.price === 'object' && s.price.amount != null) 
    ? s.price.amount 
    : (s.price_per_night || s.pricePerNight || (typeof s.price === 'number' ? s.price : null));

  return {
    ...s,
    id: s.id || s._id || s.slug,
    _id: s._id || s.id || s.slug,
    name: s.name || s.title,
    title: s.title || s.name,
    city: city,
    district: district,
    location: displayLocation,
    displayLocation: displayLocation,
    type: s.category || s.type || (isKmvn ? 'Government Tourist Rest House' : 'Homestay'),
    category: s.category || s.type || (isKmvn ? 'Government Tourist Rest House' : 'Homestay'),
    pricePerNight: priceVal,
    price: s.price || (priceVal ? { amount: priceVal, currency: 'INR', provenance: 'VERIFIED' } : { amount: null, provenance: 'UNKNOWN' }),
    priceDisplay: priceVal ? `₹${priceVal.toLocaleString('en-IN')}/night` : 'Price not verified',
    amenities: (Array.isArray(s.amenities) && s.amenities.length > 0) ? s.amenities : (Array.isArray(s.facilities) ? s.facilities : []),
    facilities: (Array.isArray(s.facilities) && s.facilities.length > 0) ? s.facilities : (Array.isArray(s.amenities) ? s.amenities : []),
    image: finalImg,
    images: Array.isArray(s.images) && s.images.length > 0 ? s.images : (finalImg ? [{ url: finalImg }] : []),
    contact: s.contact || s.phone || null,
    phone: s.phone || s.contact || null,
    isGovt: isKmvn,
    rating: s.rating || null,
    reviews: s.reviewsCount || s.reviewCount || s.reviews || 0,
    reviewsCount: s.reviewsCount || s.reviewCount || 0,
    isVerified: s.isVerified !== false
  };
};

export const getStays = async (params = {}) => {
  const response = await api.get('/stays', { params });
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    response.data.data = response.data.data.map(normalizeStay);
    return response.data;
  }
  return {
    success: false,
    data: [],
    count: 0,
    message: response.data?.message || 'Failed to fetch verified stays'
  };
};

export const getStayById = async (id) => {
  const response = await api.get(`/stays/${id}`);
  if (response.data && response.data.data) {
    response.data.data = normalizeStay(response.data.data);
  }
  return response.data;
};

export const createStay = async (data) => {
  const response = await api.post('/stays', data);
  return response.data;
};

export const updateStay = async (id, data) => {
  const response = await api.put(`/stays/${id}`, data);
  return response.data;
};

export const deleteStay = async (id) => {
  const response = await api.delete(`/stays/${id}`);
  return response.data;
};

export default {
  normalizeStay,
  getStays,
  getStayById,
  createStay,
  updateStay,
  deleteStay
};
