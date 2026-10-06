import api from './api';

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const registerPartner = async (partnerData) => {
  const response = await api.post('/auth/register-partner', partnerData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const googleLogin = async (data) => {
  const response = await api.post('/auth/google', data);
  return response.data;
};

export const verifyOtp = async (payload) => {
  const response = await api.post('/auth/verify-otp', payload);
  return response.data;
};

export const resendOtp = async (payload) => {
  const response = await api.post('/auth/resend-otp', payload);
  return response.data;
};

export const refreshToken = async (token) => {
  const response = await api.post('/auth/refresh', { refreshToken: token });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
};

export const verifyResetOtp = async (payload) => {
  const response = await api.post('/auth/verify-reset-otp', payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await api.post('/auth/change-password', payload);
  return response.data;
};

export const sendEmailVerification = async () => {
  const response = await api.post('/auth/send-email-verification');
  return response.data;
};

export const verifyEmail = async (payload) => {
  const response = await api.post('/auth/verify-email', payload);
  return response.data;
};
