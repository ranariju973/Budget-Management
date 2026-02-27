import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = [
  { icon: '✏️', title: 'Sign in to your account', desc: 'Enter your credentials to access your dashboard.' },
  { icon: '📊', title: 'Track your expenses', desc: 'Log daily spending and stay on top of your budget.' },
  { icon: '🎯', title: 'Start saving with FinKart', desc: 'Set goals and watch your savings grow over time.' },
];

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

      {/* ───── Left · Gradient Panel with Steps ───── */}
      <div className="hidden lg:flex lg:w-[48%] p-6">
        <div
          className="w-full rounded-3xl flex flex-col justify-center px-12 py-14 relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 opacity-10 rounded-3xl"
               style={{ background: 'linear-gradient(135deg, var(--color-surface) 0%, transparent 50%, var(--color-surface) 100%)' }} />

          {/* Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                   style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}>F</div>
              <span className="text-base font-bold tracking-tight" style={{ color: 'var(--color-surface)' }}>FinKart</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold leading-tight mb-2" style={{ color: 'var(--color-surface)' }}>
              Get started with us
            </h1>
            <p className="text-sm mb-12" style={{ color: 'var(--color-surface)', opacity: 0.6 }}>
              Manage your budget in three simple steps.
            </p>

            {/* Step cards with timeline */}
            <div className="space-y-5 relative">
              {/* Timeline line */}
              <div className="absolute left-[-20px] top-4 bottom-4 w-px" style={{ backgroundColor: 'var(--color-surface)', opacity: 0.15 }} />

              {STEPS.map((step, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="absolute left-[-24px] top-4 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-surface)', opacity: 0.4 }} />

                  {/* Glass card */}
                  <div
                    className="flex-1 rounded-xl px-5 py-4"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      opacity: 0.95,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{step.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{step.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ───── Right · Form ───── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>
            Sign in to FinKart
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Enter your details to sign in to your account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-colors"
                style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-colors"
                style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-border-strong)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
            >
              {submitting ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'transparent' }} /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {"Don't have an account? "}
            <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--color-text)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
