import { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Set Native Platform UI Colors (Android)
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setBackgroundColor({ color: darkMode ? '#000000' : '#ffffff' }).catch(() => {});
        StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light }).catch(() => {});
      });
      import('@capgo/capacitor-navigation-bar').then(({ NavigationBar }) => {
        NavigationBar.setNavigationBarColor({ color: darkMode ? '#000000' : '#ffffff', darkButtons: !darkMode }).catch(() => {});
      });
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    setDarkMode((prev) => !prev);
    // Remove after transition completes
    setTimeout(() => root.classList.remove('theme-transitioning'), 200);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
