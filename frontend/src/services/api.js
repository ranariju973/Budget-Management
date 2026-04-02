import axios from 'axios';
import { addToOfflineQueue, getOfflineCache, setOfflineCache } from './syncService';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // 60s — handles Render free-tier cold starts (~30-50s)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!navigator.onLine) {
      if (config.method === 'get') {
        const cachedData = getOfflineCache(config.url);
        if (cachedData) {
          config.adapter = () => {
            return Promise.resolve({
              data: cachedData,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
              request: {}
            });
          };
        }
      } else {
        addToOfflineQueue(config);
        config.adapter = () => {
          return Promise.resolve({
            data: { _id: Date.now().toString(), message: 'Offline mock success' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
          });
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (auto-logout)
// Only logout on real 401 from server, NOT on network errors (Render cold start)
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      setOfflineCache(response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    // error.response exists = server replied with 401 (token truly invalid/expired)
    // error.response missing = network error / timeout (server sleeping, don't logout)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getGoogleAuthUrl = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  // Remove trailing slash if any
  const cleanBase = base.replace(/\/$/, '');
  
  // If the base URL already includes /api, just append /auth/google
  if (cleanBase.endsWith('/api')) {
    return `${cleanBase}/auth/google`;
  }
  // Otherwise append /api/auth/google
  return `${cleanBase}/api/auth/google`;
};

export default api;
