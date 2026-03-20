import { useEffect } from 'react';
import api from '../services/api';

// Base64Url to Uint8Array converter for VAPID key
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * useExpenseReminder - True Web Push Notifications
 * - Requests Notification permission on mount
 * - Registers Service Worker
 * - Subscribes to PushManager
 * - Sends subscription to backend
 */
const useExpenseReminder = () => {
  useEffect(() => {
    // Skip if browser doesn't support Service Workers or Push API
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported by this browser.');
      return;
    }

    const initPushNotifications = async () => {
      try {
        // Request permission
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        } else if (Notification.permission !== 'granted') {
          return;
        }

        // Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Check for existing subscription to avoid unnecessary API calls
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Fetch VAPID public key from backend
          const res = await api.get('/notifications/vapidPublicKey');
          const vapidPublicKey = res.data.publicKey;
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

          // Subscribe to PushManager
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        }

        // Send subscription to backend
        await api.post('/notifications/subscribe', subscription);
        console.log('Successfully registered for Web Push notifications.');

      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initPushNotifications();
  }, []);
};

export default useExpenseReminder;
