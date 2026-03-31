import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinGroup } from '../services/splitGroupService';
import { FiUsers, FiCheck, FiAlertCircle } from 'react-icons/fi';

const JoinGroup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error | auth-required
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      // Save the invite token and redirect to login
      sessionStorage.setItem('pendingInvite', token);
      setStatus('auth-required');
      return;
    }

    // Try to join the group
    const doJoin = async () => {
      try {
        const res = await joinGroup(token);
        setGroupName(res.data.group?.name || 'the group');
        setMessage(res.data.message);
        setStatus('success');
        // Clear any pending invite
        sessionStorage.removeItem('pendingInvite');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to join group');
        setStatus('error');
      }
    };

    doJoin();
  }, [token, isAuthenticated, authLoading]);

  // Auto-redirect after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <div
        className="rounded-[24px] p-8 max-w-sm w-full text-center card-shadow"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Joining group...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
            >
              <FiCheck size={28} style={{ color: '#22c55e' }} />
            </div>
            <h2 className="text-[18px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Joined!
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
              You've joined <strong>{groupName}</strong>
            </p>
            <p className="text-[12px] mt-3" style={{ color: 'var(--color-text-muted)' }}>
              Redirecting to dashboard...
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2.5 text-[14px] font-semibold rounded-xl transition-colors tap-effect"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
            >
              <FiAlertCircle size={28} style={{ color: 'var(--color-danger)' }} />
            </div>
            <h2 className="text-[18px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Couldn't Join
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2.5 text-[14px] font-semibold rounded-xl transition-colors tap-effect"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'auth-required' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-surface-alt)' }}
            >
              <FiUsers size={28} style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            <h2 className="text-[18px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              Sign In Required
            </h2>
            <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
              You need a FinKart account to join this group. Sign in or create an account first.
            </p>
            <button
              onClick={handleLoginRedirect}
              className="mt-4 w-full py-2.5 text-[14px] font-semibold rounded-xl transition-colors tap-effect"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
            >
              Sign In / Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;
