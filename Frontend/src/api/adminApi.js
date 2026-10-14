import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Generic CRUD operations
export const fetchItems = async (type) => {
  let endpoint = `/${type}`;
  if (type === 'bookings') endpoint = '/admin/bookings';
  else if (type === 'reviews') endpoint = '/admin/reviews';
  else if (type === 'users') endpoint = '/admin/users';
  else if (type === 'partners') endpoint = '/admin/partners';
  
  const response = await api.get(endpoint);
  return response.data;
};

export const createItem = async (type, data) => {
  const response = await api.post(`/${type}`, data);
  return response.data;
};

export const updateItem = async (type, id, data) => {
  let endpoint = `/${type}/${id}`;
  if (type === 'bookings') endpoint = `/admin/bookings/${id}/status`;
  else if (type === 'reviews') endpoint = `/admin/reviews/${id}/status`;
  else if (type === 'users') endpoint = `/admin/users/${id}/role`;
  
  const response = await api.patch(endpoint, data);
  return response.data;
};

export const deleteItem = async (type, id) => {
  let endpoint = `/${type}/${id}`;
  if (type === 'reviews') endpoint = `/admin/reviews/${id}`;
  else if (type === 'users') endpoint = `/admin/users/${id}`;
  else if (type === 'bookings') endpoint = `/admin/bookings/${id}`;
  else if (type === 'partners') endpoint = `/admin/partners/${id}`;
  
  const response = await api.delete(endpoint);
  return response.data;
};

// Bookings
export const getAllBookings = async () => {
  const response = await api.get('/admin/bookings');
  return response.data;
};

export const updateBookingStatus = async (id, statusData) => {
  const response = await api.patch(`/admin/bookings/${id}/status`, statusData);
  return response.data;
};

// Reviews
export const getAllReviewsAdmin = async () => {
  const response = await api.get('/admin/reviews');
  return response.data;
};

export const updateReviewStatusAdmin = async (id, status) => {
  const response = await api.patch(`/admin/reviews/${id}/status`, { status });
  return response.data;
};

export const deleteReviewAdmin = async (id) => {
  const response = await api.delete(`/admin/reviews/${id}`);
  return response.data;
};

// Users
export const getAllUsersAdmin = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserRoleAdmin = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

// Images
export const uploadAdminImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAdminImage = async (publicId) => {
  const response = await api.delete(`/upload/${encodeURIComponent(publicId)}`);
  return response.data;
};

