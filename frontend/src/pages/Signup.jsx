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
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: 'var(--color-surface)' }}>

      {/* ───── Left · Dark showcase panel ───── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden" style={{ backgroundColor: 'var(--color-accent)' }}>
        {/* Decorative concentric circles */}
        <div className="absolute" style={{ top: '18%', left: '20%', width: '420px', height: '420px' }}>
          {[420, 320, 220].map((size, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${size}px`, height: `${size}px`,
              top: `${(420 - size) / 2}px`, left: `${(420 - size) / 2}px`,
              border: `1px solid var(--color-surface)`,
              opacity: 0.06 + i * 0.03,
            }} />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full px-10 py-10">
          {/* Top tagline */}
          <p className="text-xs tracking-wide" style={{ color: 'var(--color-surface)', opacity: 0.5 }}>
            Smart budgeting made simple — track, save, and grow with FinKart.
          </p>

          {/* Hero heading */}
          <div className="mt-auto mb-auto">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight" style={{ color: 'var(--color-surface)' }}>
              Start your<br />journey
            </h1>
          </div>

          {/* Floating mock card */}
          <div className="absolute right-6 bottom-[22%] w-52 rounded-2xl p-4 shadow-2xl" style={{
            backgroundColor: 'var(--color-surface)', opacity: 0.95
          }}>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Savings Goal</p>
            <p className="text-2xl font-bold tracking-tight mb-3" style={{ color: 'var(--color-text)' }}>₹50,000</p>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div className="h-full rounded-full" style={{ width: '62%', backgroundColor: 'var(--color-accent)' }} />
            </div>
            <p className="text-[9px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>62% achieved</p>
          </div>
        </div>
      </div>

      {/* ───── Right · Form panel ───── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top nav */}
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                 style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}>F</div>
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>FinKart</span>
          </div>
          <Link to="/login" className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold tracking-tight mb-8" style={{ color: 'var(--color-text)' }}>
              Sign Up
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                maxLength={50}
                className="w-full px-5 py-3.5 text-sm rounded-full outline-none transition-colors"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-5 py-3.5 text-sm rounded-full outline-none transition-colors"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password (min 8 chars)"
                  maxLength={72}
                  className="w-full px-5 py-3.5 pr-11 text-sm rounded-full outline-none transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-sm font-semibold rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'transparent' }} />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    Sign Up
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-text)' }}>Sign in</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>&copy; 2025-2026 FinKart</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
