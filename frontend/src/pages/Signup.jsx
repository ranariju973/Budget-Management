import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, and a number');
      return;
    }
    setSubmitting(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
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
            Move Fast.<br />Break Nothing.
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
                <h3 className="auth-feature-title">Remove Bottlenecks</h3>
                <p className="auth-feature-desc">
                  Stop worrying about budgets and receipts. FinKart your expense tracking so you can focus on what matters.
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
                <h3 className="auth-feature-title">Access Risk Analysis</h3>
                <p className="auth-feature-desc">
                  Visualize your financial health with smart charts, and lending & borrowing summaries all in one place.
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
            <h2>Create an account.</h2>
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                maxLength={50}
              />
            </div>
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
              />
            </div>
            <div className="auth-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min 8 chars)"
                maxLength={72}
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

            <p className="auth-terms">
              By signing up you agree to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={submitting} className="auth-btn-primary">
              {submitting ? <div className="auth-spinner" /> : 'Sign Up'}
            </button>
          </form>

          <p className="auth-footer-note">&copy; 2025–2026 FinKart</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
