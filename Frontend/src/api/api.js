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
  withCredentials: true, // Enables HTTP-only cookies transmission
  timeout: 30000,
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

// Automatic token refresh interceptor & server failover
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized with Refresh Token rotation
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/signup')
    ) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const refreshRes = await axios.post(
          `${api.defaults.baseURL || baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken || undefined },
          { withCredentials: true }
        );

        if (refreshRes.data && refreshRes.data.success) {
          const newToken = refreshRes.data.data?.token || refreshRes.data.token;
          const newRefreshToken = refreshRes.data.data?.refreshToken || refreshRes.data.refreshToken;

          if (newToken) {
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        // Refresh token failed or expired -> clean session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    }

    // Failover to Live Production Backend if local server is unreachable
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const isLocalhost = originalRequest && (
      (originalRequest.baseURL && originalRequest.baseURL.includes('localhost')) ||
      (originalRequest.url && originalRequest.url.startsWith('http://localhost'))
    );

    if (isNetworkError && isLocalhost && !originalRequest._failoverRetry) {
      originalRequest._failoverRetry = true;
      originalRequest.baseURL = LIVE_BACKEND_URL;
      api.defaults.baseURL = LIVE_BACKEND_URL;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
