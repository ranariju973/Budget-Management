import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: 'var(--color-surface)' }}>

      {/* ───── Left · Dark panel with rounded TR & BR corners ───── */}
      <div className="hidden lg:flex lg:w-[46%] p-4 pr-0">
        <div
          className="w-full relative overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--color-accent)',
            borderRadius: '0 2rem 2rem 0',
          }}
        >
          {/* Animated decorative concentric circles */}
          <div className="absolute anim-pulse-ring" style={{ top: '14%', left: '16%', width: '440px', height: '440px' }}>
            {[440, 330, 220].map((size, i) => (
              <div key={i} className="absolute rounded-full" style={{
                width: `${size}px`, height: `${size}px`,
                top: `${(440 - size) / 2}px`, left: `${(440 - size) / 2}px`,
                border: `1px solid var(--color-surface)`,
                opacity: 0.05 + i * 0.03,
              }} />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between h-full w-full px-10 py-10">
            {/* Top tagline */}
            <p className="text-xs tracking-wide anim-fade-up" style={{ color: 'var(--color-surface)', opacity: 0.5, animationDelay: '0.1s' }}>
              Smart budgeting made simple — track, save, and grow.
            </p>

            {/* Hero heading with vanish animation */}
            <div className="mt-auto mb-auto">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight anim-vanish-in" style={{ color: 'var(--color-surface)', animationDelay: '0.2s' }}>
                Manage<br />your budget
              </h1>
              <p className="text-sm mt-4 leading-relaxed anim-fade-up" style={{ color: 'var(--color-surface)', opacity: 0.45, animationDelay: '0.5s' }}>
                Join thousands who trust <span className="font-semibold" style={{ opacity: 1 }}>FinKart</span> to track expenses, set goals, and build better saving habits.
              </p>

              {/* Stats row */}
              <div className="flex gap-8 mt-8">
                {[{ val: '10K+', label: 'Users' }, { val: '₹2Cr+', label: 'Tracked' }, { val: '4.8', label: 'Rating' }].map((s, i) => (
                  <div key={i} className="anim-fade-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-surface)' }}>{s.val}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-surface)', opacity: 0.4 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating mock card */}
            <div className="absolute right-6 bottom-[18%] w-52 rounded-2xl p-4 shadow-2xl anim-float" style={{
              backgroundColor: 'var(--color-surface)', opacity: 0.95
            }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Weekly Overview</p>
              <p className="text-2xl font-bold tracking-tight mb-3" style={{ color: 'var(--color-text)' }}>₹12,450</p>
              <div className="flex items-end gap-1.5 h-10">
                {[55, 70, 40, 85, 60, 45, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{
                    height: `${h}%`,
                    backgroundColor: i === 3 ? 'var(--color-accent)' : 'var(--color-border)',
                  }} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-[8px] flex-1 text-center" style={{ color: 'var(--color-text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Right · Form panel with depth ───── */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{
          boxShadow: '-8px 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top nav */}
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                 style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}>F</div>
            <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>FinKart</span>
          </div>
          <Link to="/signup" className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Sign Up
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold tracking-tight mb-8 anim-fade-up" style={{ color: 'var(--color-text)' }}>
              Sign In
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email or Username"
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
                  placeholder="Password"
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {"Don't have an account? "}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--color-text)' }}>Sign up</Link>
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

export default Login;
