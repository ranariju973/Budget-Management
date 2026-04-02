import axios from 'axios';
import { addToOfflineQueue, getOfflineCache, setOfflineCache, updateOfflineCacheOptimistically } from './syncService';
import { scheduleLocalNotification } from './notificationService';

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
        config.adapter = () => {
          return Promise.resolve({
            data: cachedData || (config.url.includes('auth') ? {} : []),
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
          });
        };
      } else {
        addToOfflineQueue(config);
        updateOfflineCacheOptimistically(config);
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
    } else if (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'delete') {
      // Dynamic notification messages based on endpoint
      const entityMatch = response.config.url.match(/api\/([^/]+)/);
      if (entityMatch) {
         let action = response.config.method === 'post' ? 'added' : (response.config.method === 'put' ? 'updated' : 'removed');
         let entity = entityMatch[1];
         // Simple capitalize and generic message
         entity = entity.charAt(0).toUpperCase() + entity.slice(1);
         scheduleLocalNotification('Action Successful!', `${entity} successfully ${action}.`);
      }
    }
    return response;
  },
  (error) => {
    // error.response missing = network error / timeout (server sleeping or bad connection)
    if (!error.response) {
      if (error.config.method === 'get') {
        const cachedData = getOfflineCache(error.config.url);
        return Promise.resolve({
          data: cachedData || (error.config.url.includes('auth') ? {} : []),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
          request: {}
        });
      } else {
        addToOfflineQueue(error.config);
        updateOfflineCacheOptimistically(error.config);
        return Promise.resolve({
          data: { _id: Date.now().toString(), message: 'Offline mock success' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
          request: {}
        });
      }
    }

    // error.response exists = server replied with 4xx/5xx
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getGoogleAuthUrl = (source = 'web') => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  // Remove trailing slash if any
  const cleanBase = base.replace(/\/$/, '');
  
  let url = '';
  // If the base URL already includes /api, just append /auth/google
  if (cleanBase.endsWith('/api')) {
    url = `${cleanBase}/auth/google`;
  } else {
    // Otherwise append /api/auth/google
    url = `${cleanBase}/api/auth/google`;
  }

  return `${url}?source=${source}`;
};

export default api;
