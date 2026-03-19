import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
      toast.error('Password must be at least 8 characters');
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-[400px] flex flex-col items-center anim-fade-up">
        
        {/* Logo/Icon Area */}
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-sm" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-background)' }}>
          <span className="text-3xl font-bold tracking-tighter">F</span>
        </div>
        
        <h1 className="text-[28px] font-semibold tracking-tight text-center mb-2" style={{ color: 'var(--color-text)' }}>
          Create an account
        </h1>
        <p className="text-[15px] text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Join FinKart to track your finances effortlessly.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              maxLength={50}
              className="w-full px-4 py-3.5 text-[16px] rounded-xl outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
              style={{ 
                backgroundColor: 'var(--color-surface)', 
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}
            />
            
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
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
                placeholder="Password (min 8 chars)"
                maxLength={72}
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

          <p className="text-[13px] text-center mt-6 mb-2" style={{ color: 'var(--color-text-muted)' }}>
            By signing up you agree to our Terms of Use.
          </p>

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full py-3.5 text-[16px] font-semibold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center h-[52px]"
            style={{ 
              backgroundColor: 'var(--color-text)', 
              color: 'var(--color-background)' 
            }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin dark:border-black/30 dark:border-t-black" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[15px]">
          <span style={{ color: 'var(--color-text-secondary)' }}>Already have an account? </span>
          <Link to="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--color-text)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
