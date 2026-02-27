import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: '📊', title: 'Track Expenses', desc: 'Log daily spending and stay on top of your budget.' },
  { icon: '🎯', title: 'Set Budget Goals', desc: 'Create monthly goals and watch your progress.' },
  { icon: '🤝', title: 'Borrow & Lend', desc: 'Keep track of money you owe or are owed.' },
  { icon: '📈', title: 'Visual Insights', desc: 'Charts and stats to understand your spending habits.' },
];

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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

  const inputStyle = { backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* ---- Left Branding Panel ---- */}
      <div
        className="lg:w-1/2 flex flex-col justify-center px-8 py-10 lg:px-16"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">FinKart</h1>
        <p className="mt-2 text-sm lg:text-base opacity-85">Your personal budget companion — simple, fast, and free.</p>

        <div className="mt-8 space-y-5 hidden sm:block">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-xs opacity-75 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs opacity-60 hidden lg:block">Built with React &bull; Node.js &bull; MongoDB</p>
      </div>

      {/* ---- Right Form Panel ---- */}
      <div className="lg:w-1/2 flex items-center justify-center px-4 py-10 lg:py-0">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Create Account</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Start managing your budget</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" maxLength={50} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }} />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }} />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 8 chars, Aa + 1" maxLength={72} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }} />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}>
              {submitting ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'transparent' }} /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--color-text)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
