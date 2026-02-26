import { useEffect, useRef } from 'react';

/**
 * useExpenseReminder — Browser notification at 10:00 PM daily.
 * Asks "Have you added your expenses today?" as a gentle nudge.
 *
 * - Requests Notification permission on mount
 * - Checks every 30s if it's 22:00
 * - Uses localStorage to avoid duplicate notifications on the same day
 */
const REMINDER_HOUR = 22; // 10 PM
const STORAGE_KEY = 'lastExpenseReminderDate';
const CHECK_INTERVAL = 30_000; // 30 seconds

const useExpenseReminder = () => {
  const timerRef = useRef(null);

  useEffect(() => {
    // Skip if browser doesn't support notifications
    if (!('Notification' in window)) return;

    // Request permission (no-op if already granted/denied)
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkAndNotify = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const today = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const lastSent = localStorage.getItem(STORAGE_KEY);

      // Fire only once per day, at or after 10 PM
      if (now.getHours() >= REMINDER_HOUR && lastSent !== today) {
        localStorage.setItem(STORAGE_KEY, today);

        const notification = new Notification('FinKart — Expense Reminder', {
          body: 'Have you added your expenses today? Keep your budget on track!',
          icon: '/favicon.ico',
          tag: 'expense-reminder', // prevents stacking duplicates
          requireInteraction: false,
        });

        // Auto-close after 8 seconds
        setTimeout(() => notification.close(), 8000);
      }
    };

    // Check immediately on mount, then every 30s
    checkAndNotify();
    timerRef.current = setInterval(checkAndNotify, CHECK_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
};

export default useExpenseReminder;
