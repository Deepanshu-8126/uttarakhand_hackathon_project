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
  timeout: 10000,
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

// Automatic seamless failover to Live Production Backend if local server is unreachable
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Gracefully clean expired/invalid auth tokens on 401
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const isLocalhost = originalRequest && (
      (originalRequest.baseURL && originalRequest.baseURL.includes('localhost')) ||
      (originalRequest.url && originalRequest.url.startsWith('http://localhost'))
    );

    if (isNetworkError && isLocalhost && !originalRequest._retry) {
      console.warn('[API Failover] Local backend offline, falling back to Live Cloud Backend:', LIVE_BACKEND_URL);
      originalRequest._retry = true;
      originalRequest.baseURL = LIVE_BACKEND_URL;
      api.defaults.baseURL = LIVE_BACKEND_URL;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;

