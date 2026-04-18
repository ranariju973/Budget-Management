import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { getGoogleAuthUrl } from '../services/api';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

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

  const handleGoogleLogin = async () => {
    const platform = Capacitor.isNativePlatform() ? 'app' : 'web';
    const url = getGoogleAuthUrl(platform);

    if (platform === 'app') {
      await Browser.open({ url });
      return;
    }

    window.location.href = url;
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-surface-alt px-5 py-8 text-(--color-text) sm:px-8 lg:px-12"
      style={{ fontFamily: '"Avenir Next", "Nunito Sans", "Segoe UI", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute top-1/3 -right-10 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl dark:bg-amber-500/10" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="order-2 rounded-3xl border border-border bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:bg-black/40 lg:order-1 lg:p-10">
          <div className="anim-vanish-in">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold tracking-wide">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-(--color-accent) text-surface">F</span>
              FinKart Money OS
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Keep every
              <span className="block bg-linear-to-r from-cyan-600 via-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-emerald-300 dark:to-amber-200">
                rupee in motion.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Track budgets, settle split expenses, and monitor lending activity from one clean dashboard built for daily use.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="anim-fade-up rounded-2xl border border-border bg-surface/90 p-4" style={{ animationDelay: '0.15s' }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Money In / Out</p>
              <p className="mt-3 text-2xl font-bold">Realtime</p>
              <p className="mt-1 text-sm text-text-secondary">Income, expenses, and balances updated instantly.</p>
            </article>

            <article className="anim-fade-up rounded-2xl border border-border bg-surface/90 p-4" style={{ animationDelay: '0.3s' }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Smart Reports</p>
              <p className="mt-3 text-2xl font-bold">Actionable</p>
              <p className="mt-1 text-sm text-text-secondary">Visual trends to improve saving habits each month.</p>
            </article>
          </div>
        </section>

        <section className="order-1 anim-fade-up rounded-3xl border border-border bg-surface p-6 shadow-[0_22px_70px_rgba(0,0,0,0.08)] lg:order-2 lg:p-8" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-2xl border border-border bg-surface-alt p-1">
            <div className="grid grid-cols-2 gap-1 text-sm font-semibold">
              <Link to="/login" className="rounded-xl bg-(--color-accent) px-4 py-2.5 text-center text-surface">
                Sign In
              </Link>
              <Link to="/signup" className="rounded-xl px-4 py-2.5 text-center text-text-secondary transition-colors hover:text-(--color-text)">
                Create Account
              </Link>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back.</h2>
            <p className="mt-1 text-sm text-text-secondary">Sign in to continue managing your finances.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Email Address</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-border bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-text-muted focus:border-border-strong"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-border bg-transparent px-4 pr-12 text-sm outline-none transition-colors placeholder:text-text-muted focus:border-border-strong"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-text-secondary transition-colors hover:text-(--color-text)"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-(--color-accent) px-4 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <span className="auth-spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <span className="h-px flex-1 bg-border" />
            or continue with
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-transparent text-sm font-semibold transition-colors hover:bg-surface-hover"
            onClick={handleGoogleLogin}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-text-muted">&copy; 2025-2026 FinKart</p>
        </section>
      </div>
    </main>
  );
};

export default Login;
