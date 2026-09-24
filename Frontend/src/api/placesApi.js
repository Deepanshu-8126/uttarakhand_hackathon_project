import api from './api';

export const placesApi = {
  // Search places dynamically
  searchPlaces: async (query, { lat, lng, radius } = {}) => {
    const params = { query };
    if (lat && lng) {
      params.lat = lat;
      params.lng = lng;
    }
    if (radius) params.radius = radius;
    const res = await api.get('/places/search', { params });
    return res.data;
  },

  // Get nearby hidden viewpoints, dhabas, tea stalls, campsites
  getNearbyPlaces: async ({ lat, lng, type = 'all', radius = 15000, keyword = '' } = {}) => {
    const params = { lat, lng, type, radius, keyword };
    const res = await api.get('/places/nearby', { params });
    return res.data;
  },

  // Get rich place details (reviews, live rating, high-res photos)
  getPlaceDetails: async ({ placeId, name }) => {
    const params = {};
    if (placeId) params.placeId = placeId;
    if (name) params.name = name;
    const res = await api.get('/places/details', { params });
    return res.data;
  },

  // Check integration status
  getStatus: async () => {
    const res = await api.get('/places/status');
    return res.data;
  }
};

export default placesApi;
