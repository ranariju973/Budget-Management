import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { processOfflineQueue } from './services/syncService';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import JoinGroup from './pages/JoinGroup';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import { setupDailyReminders } from './services/notificationService';

import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

function App() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      processOfflineQueue();
    };
    const handleOffline = () => {
      toast('You are offline. Data will be saved locally.', { icon: '📵', duration: 4000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on load
    if (navigator.onLine) {
      processOfflineQueue();
    }

    setupDailyReminders();

    // Capacitor App URL Listener for Deep Linking OAuth Redirects
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appUrlOpen', async (data) => {
        // Handle both older https scheme and new custom finkart:// scheme
        if (data.url.includes('oauth-callback') || data.url.includes('auth-callback')) {
          const parsedUrl = new URL(data.url);
          const token = parsedUrl.searchParams.get('token');
          if (token) {
            await Browser.close();
            window.location.href = `/oauth-callback?token=${token}`;
          }
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: 'var(--color-surface-alt)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '13px',
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: { primary: 'var(--color-accent)', secondary: 'var(--color-surface)' },
          },
          error: {
            iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-surface)' },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/oauth-callback"
          element={isAuthenticated ? <Navigate to="/" replace /> : <OAuthCallback />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/join/:token" element={<JoinGroup />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
