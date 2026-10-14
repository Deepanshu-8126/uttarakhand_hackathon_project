import api from './api';

/**
 * Fetch personalized discovery items (Nearby destinations, stays, rentals, guides, activities)
 * @param {Object} [params] - Optional query params ({ city, district, lat, lng, radius, refresh })
 */
export const getPersonalizedHome = async (params = {}) => {
  try {
    const response = await api.get('/personalized/home', { params });
    return response.data;
  } catch (err) {
    try {
      const [destRes, staysRes] = await Promise.all([
        api.get('/destinations').catch(() => ({ data: [] })),
        api.get('/stays').catch(() => ({ data: [] }))
      ]);
      const destinations = destRes?.data?.data || destRes?.data || [];
      const stays = staysRes?.data?.data || staysRes?.data || [];

      return {
        success: true,
        detectedLocation: {
          city: params.city || 'Dehradun',
          district: params.district || 'Dehradun',
          source: 'curated_fallback'
        },
        data: {
          destinations: Array.isArray(destinations) ? destinations.slice(0, 6) : [],
          stays: Array.isArray(stays) ? stays.slice(0, 4) : [],
          rentals: [],
          guides: [],
          activities: []
        }
      };
    } catch (fallbackErr) {
      return {
        success: true,
        detectedLocation: { city: 'Dehradun', district: 'Dehradun', source: 'default' },
        data: { destinations: [], stays: [], rentals: [], guides: [], activities: [] }
      };
    }
  }
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
