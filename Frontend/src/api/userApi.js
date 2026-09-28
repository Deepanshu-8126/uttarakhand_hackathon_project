import api from './api';

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getSavedItems = async () => {
  const response = await api.get('/users/saved-items');
  return response.data;
};

export const createExploreLater = async (payload) => {
  const response = await api.post('/users/explore-later', payload);
  return response.data;
};

export const deleteExploreLater = async (id) => {
  const response = await api.delete(`/users/explore-later/${id}`);
  return response.data;
};

