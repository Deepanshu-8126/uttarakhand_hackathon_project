/**
 * Destination Service — Real MongoDB API Client Proxy
 */
import api from '../api/api';

export const getAllDestinations = async () => {
  try {
    const res = await api.get('/destinations');
    return res.data?.destinations || res.data?.data || res.data || [];
  } catch (err) {
    console.error('Failed to fetch destinations from MongoDB:', err);
    return [];
  }
};

export const getDestinationById = async (id) => {
  try {
    const res = await api.get(`/destinations/${id}`);
    return res.data?.destination || res.data?.data || res.data || null;
  } catch (err) {
    console.error(`Failed to fetch destination ${id} from MongoDB:`, err);
    return null;
  }
};

export const filterDestinations = (destinations = [], { category = 'all', region = 'all', searchQuery = '' } = {}) => {
  return destinations.filter((dest) => {
    if (category !== 'all' && dest.category !== category) return false;
    if (region !== 'all' && dest.region?.toLowerCase() !== region?.toLowerCase()) return false;
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = dest.name?.toLowerCase().includes(q) || dest.title?.toLowerCase().includes(q);
      const matchDistrict = dest.district?.toLowerCase().includes(q) || dest.location?.district?.toLowerCase().includes(q);
      const matchTags = dest.tags && dest.tags.some((t) => t.toLowerCase().includes(q));
      const matchDesc = (dest.shortDesc || dest.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDistrict && !matchTags && !matchDesc) return false;
    }
    return true;
  });
};
