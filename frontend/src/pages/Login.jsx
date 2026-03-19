import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ───── Left Panel ───── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 className="auth-hero-title anim-vanish-in">
            Welcome<br />Back 🥳
          </h1>

          <div className="auth-features">
            <div className="auth-feature-item anim-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="auth-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="6" width="3" height="12" rx="1.5" />
                  <rect x="10" y="4" width="3" height="16" rx="1.5" />
                  <rect x="16" y="8" width="3" height="8" rx="1.5" />
                </svg>
              </div>
              <div>
                <h3 className="auth-feature-title">Track Everything</h3>
                <p className="auth-feature-desc">
                  Monitor your income, expenses, loans, and savings all in one place with an intuitive dashboard.
                </p>
              </div>
            </div>

            <div className="auth-feature-item anim-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="auth-feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="4" rx="1" />
                  <rect x="3" y="14" width="18" height="4" rx="1" />
                </svg>
              </div>
              <div>
                <h3 className="auth-feature-title">Smart Insights</h3>
                <p className="auth-feature-desc">
                  Get intelligent reports on spending patterns and saving habits with real-time analytics and visual charts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-logo anim-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="auth-logo-mark">F</div>
          <span className="auth-logo-text">FinKart</span>
        </div>
      </div>

      {/* ───── Right Panel · Form Card ───── */}
      <div className="auth-right">
        <div className="auth-card anim-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="auth-card-header">
            <h2>Sign in to your account.</h2>
            <p>Don&apos;t have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email or Username"
              />
            </div>
            <div className="auth-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" disabled={submitting} className="auth-btn-primary">
              {submitting ? <div className="auth-spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button 
            type="button" 
            className="auth-btn-google"
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-note">&copy; 2025–2026 FinKart</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
