import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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

      {/* ───── Left · Form ───── */}
      <div className="lg:w-[45%] flex flex-col justify-center px-8 py-12 lg:px-20">
        {/* Brand */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                 style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}>F</div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>FinKart</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
          Welcome to<br />FinKart
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-5 max-w-sm">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
              style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
              style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
          >
            {submitting ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'transparent' }} /> : 'Sign In'}
          </button>

          <p className="text-center text-xs pt-2" style={{ color: 'var(--color-text-muted)' }}>
            {"Don't have an account? "}
            <Link to="/signup" className="font-medium hover:underline" style={{ color: 'var(--color-text)' }}>Sign up</Link>
          </p>
        </form>
      </div>

      {/* ───── Right · Decorative Showcase ───── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        {/* Decorative circles */}
        <div className="absolute w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: 'var(--color-surface)', top: '-40px', right: '-40px' }} />
        <div className="absolute w-56 h-56 rounded-full opacity-10" style={{ backgroundColor: 'var(--color-surface)', bottom: '60px', left: '-30px' }} />
        <div className="absolute w-40 h-40 rounded-full opacity-5" style={{ backgroundColor: 'var(--color-surface)', top: '40%', right: '15%' }} />

        {/* Top-right info badge */}
        <div className="absolute top-8 right-10 text-right" style={{ color: 'var(--color-surface)' }}>
          <p className="text-sm font-medium opacity-90">Smart budgeting,</p>
          <p className="text-sm font-medium opacity-90">beautifully simple.</p>
          <p className="text-xs mt-2 opacity-50">Track &bull; Plan &bull; Save</p>
        </div>

        {/* Floating mock UI cards */}
        <div className="relative z-10 flex flex-col gap-4 items-center">
          {/* Dashboard card */}
          <div className="rounded-xl p-5 w-72 shadow-2xl" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</span>
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }} />
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-2 h-16 mb-3">
              {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, backgroundColor: i === 3 ? 'var(--color-accent)' : 'var(--color-border)' }} />
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Feature cards row */}
          <div className="flex gap-3">
            {/* Expense card */}
            <div className="rounded-lg p-3 w-34 shadow-xl" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
              <div className="text-lg mb-1">📊</div>
              <p className="text-xs font-semibold">Expenses</p>
              <p className="text-lg font-bold mt-1">₹12,450</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>This month</p>
            </div>
            {/* Goal card */}
            <div className="rounded-lg p-3 w-34 shadow-xl" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
              <div className="text-lg mb-1">🎯</div>
              <p className="text-xs font-semibold">Budget Goal</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: 'var(--color-accent)' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>72% used</p>
            </div>
          </div>
        </div>

        {/* Bottom-left tech stack */}
        <div className="absolute bottom-8 left-10" style={{ color: 'var(--color-surface)' }}>
          <p className="text-xs opacity-40">Built with React &bull; Node.js &bull; MongoDB</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
