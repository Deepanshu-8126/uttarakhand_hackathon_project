import api from './api';

/**
 * Fetch personalized discovery items (Nearby destinations, stays, rentals, guides, activities)
 * @param {Object} [params] - Optional query params ({ city, district, lat, lng, radius, refresh })
 */
export const getPersonalizedHome = async (params = {}) => {
  const response = await api.get('/personalized/home', { params });
  return response.data;
};

/**
 * Fetch granular nearby items for a specific category
 * @param {Object} params - { category, city, district, lat, lng, radius, limit }
 */
export const getPersonalizedNearby = async (params = {}) => {
  const response = await api.get('/personalized/nearby', { params });
  return response.data;
};

/**
 * Update authenticated user's saved location
 * @param {Object|string} locationData - { city, district, state, coordinates } or city string
 */
export const updateUserLocation = async (locationData) => {
  const payload = typeof locationData === 'string' ? { city: locationData } : locationData;
  const response = await api.patch('/users/me/location', payload);
  return response.data;
};

export default {
  getPersonalizedHome,
  getPersonalizedNearby,
  updateUserLocation
};
