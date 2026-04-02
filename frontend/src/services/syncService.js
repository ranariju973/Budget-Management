import axios from 'axios';
import toast from 'react-hot-toast';

const QUEUE_KEY = 'offline_request_queue';
const CACHE_KEY = 'offline_get_cache';

export const addToOfflineQueue = (config) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  queue.push({
    url: config.url,
    method: config.method,
    data: config.data,
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineCache = (url) => {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  return cache[url];
};

export const setOfflineCache = (url, data) => {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache[url] = data;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const processOfflineQueue = async () => {
    if (!navigator.onLine) return;
    
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    toast('Back online! Syncing data...', { icon: '🔄', duration: 4000 });
    
    const failedQueue = [];
    const token = localStorage.getItem('token');
    
    // Create a fresh instance to avoid our own interceptors
    const syncApi = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    for (const req of queue) {
        try {
            await syncApi({
                url: req.url,
                method: req.method,
                data: req.data,
            });
        } catch (err) {
            console.error('Failed to sync offline request:', req, err);
            if (!err.response || err.response.status >= 500) {
                // Keep if network error
                failedQueue.push(req);
            }
        }
    }
    
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failedQueue));
    if (failedQueue.length === 0) {
        toast.success('All offline data synced!');
    } else {
        toast.error('Some offline data failed to sync.');
    }
};
