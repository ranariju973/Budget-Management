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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-[400px] flex flex-col items-center anim-fade-up">
        
        {/* Logo/Icon Area */}
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-sm" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-background)' }}>
          <span className="text-3xl font-bold tracking-tighter">F</span>
        </div>
        
        <h1 className="text-[28px] font-semibold tracking-tight text-center mb-2" style={{ color: 'var(--color-text)' }}>
          Sign in to FinKart
        </h1>
        <p className="text-[15px] text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Enter your details to access your account.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-4">
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email or Username"
              className="w-full px-4 py-3.5 text-[16px] rounded-xl outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              style={{ 
                backgroundColor: 'var(--color-surface)', 
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}
            />
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-4 pr-12 py-3.5 text-[16px] rounded-xl outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full py-3.5 mt-4 text-[16px] font-semibold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center h-[52px]"
            style={{ 
              backgroundColor: 'var(--color-text)', 
              color: 'var(--color-background)' 
            }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin dark:border-black/30 dark:border-t-black" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[15px]">
          <span style={{ color: 'var(--color-text-secondary)' }}>Don't have an account? </span>
          <Link to="/signup" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
