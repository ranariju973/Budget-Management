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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>Budget</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>

        <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium hover:underline" style={{ color: 'var(--color-text)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
