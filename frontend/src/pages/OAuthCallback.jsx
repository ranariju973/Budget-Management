import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth(); // We need a way to set the token and fetch user

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    const handleOAuth = async () => {
      if (token) {
        localStorage.setItem('token', token);
        await fetchUser();
        toast.success('Successfully logged in with Google!');
        navigate('/');
      } else {
        toast.error('Google login failed. No token received.');
        navigate('/login');
      }
    };

    handleOAuth();
  }, [location, navigate, fetchUser]);

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
