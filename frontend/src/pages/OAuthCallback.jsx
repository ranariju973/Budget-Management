import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    const handleOAuth = () => {
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        toast.success('Successfully logged in with Google!');
        navigate('/');
      } else {
        toast.error('Google login failed. No token received.');
        navigate('/login');
      }
    };

    handleOAuth();
  }, [location, navigate, setToken]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
        <p className="text-text-secondary font-medium">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
