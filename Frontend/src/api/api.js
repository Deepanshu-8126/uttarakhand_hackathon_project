import axios from 'axios';

const LIVE_BACKEND_URL = "https://uttarakhand-hackathon-project.onrender.com/api";

let baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
if (!baseURL) {
  if (import.meta.env.PROD) {
    baseURL = LIVE_BACKEND_URL;
  } else {
    baseURL = 'http://localhost:5000/api';
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
