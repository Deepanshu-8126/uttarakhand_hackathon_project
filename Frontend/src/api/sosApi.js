import api from './api';

export const sosApi = {
  // Trigger emergency SOS
  trigger: async (payload) => {
    const res = await api.post('/sos/trigger', payload);
    return res.data;
  },

  // Get active alerts for rescue dashboard
  getActiveAlerts: async () => {
    const res = await api.get('/sos/active');
    return res.data;
  },

  // Get alert details by id or code
  getAlertById: async (id) => {
    const res = await api.get(`/sos/${id}`);
    return res.data;
  },

  // Update status (e.g. DISPATCHED, RESOLVED)
  updateStatus: async (id, statusData) => {
    const res = await api.put(`/sos/${id}/status`, statusData);
    return res.data;
  },

  // Cancel active SOS
  cancel: async (alertCode, reason) => {
    const res = await api.post('/sos/cancel', { alertCode, reason });
    return res.data;
  },

  // Get nearby rescue posts & official helplines
  getNearbyRescuePosts: async (lat, lng) => {
    const params = lat && lng ? { lat, lng } : {};
    const res = await api.get('/sos/nearby-rescue-posts', { params });
    return res.data;
  }
};

export default sosApi;
