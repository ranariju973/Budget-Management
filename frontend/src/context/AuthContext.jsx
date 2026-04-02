import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

/**
 * Decode JWT payload without a library (base64url → JSON)
 * Returns null if token is invalid or expired
 */
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired (exp is in seconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    // Validate token on init — discard if expired
    if (stored && !decodeToken(stored)) {
      localStorage.removeItem('token');
      return null;
    }
    return stored;
  });
  const [loading, setLoading] = useState(true);

  // Hydrate user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user_cache', JSON.stringify(res.data));
        } catch (error) {
          // Only log out if the server explicitly says our token is invalid (401)
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          } else {
            // We are likely offline - hydrate user from cache
            const storedUser = localStorage.getItem('user_cache');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_cache', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_cache', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.delete('/auth/account');
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        setToken,
        login,
        signup,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
