import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { getGoogleAuthUrl } from '../services/api';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const container = document.querySelector('.auth-switch-login .container');
    if (!container) return;
    if (isSignUp) container.classList.add('sign-up-mode');
    else container.classList.remove('sign-up-mode');
  }, [isSignUp]);

  const handleLoginChange = (e) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e) => {
    setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      await signup(signupForm.name, signupForm.email, signupForm.password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
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
    <div className="auth-switch-login">
      <style>{`
        .auth-switch-login,
        .auth-switch-login * {
          box-sizing: border-box;
        }

        .auth-switch-login {
          font-family: "Avenir Next", "Nunito Sans", "Segoe UI", sans-serif;
          background: linear-gradient(135deg, #6d87ff 0%, #4aa8ff 45%, #4ad4b4 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-switch-login .container {
          position: relative;
          width: 100%;
          max-width: 940px;
          height: 560px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 55px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }

        .auth-switch-login .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .auth-switch-login .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-switch-login form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 4.2rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .auth-switch-login form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch-login form.sign-in-form {
          z-index: 2;
        }

        .auth-switch-login .title {
          font-size: 2.2rem;
          color: #1f2937;
          margin-bottom: 10px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .auth-switch-login .subtitle {
          font-size: 0.88rem;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .auth-switch-login .input-field {
          max-width: 390px;
          width: 100%;
          background-color: #f4f6fb;
          margin: 8px 0;
          height: 54px;
          border-radius: 14px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          padding: 0 0.7rem 0 1rem;
          transition: 0.25s;
          border: 1px solid transparent;
        }

        .auth-switch-login .input-field:focus-within {
          border-color: #6d87ff;
          box-shadow: 0 0 0 3px rgba(109, 135, 255, 0.15);
          background-color: #ffffff;
        }

        .auth-switch-login .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 0.98rem;
          color: #111827;
          width: 100%;
        }

        .auth-switch-login .input-field input::placeholder {
          color: #9ca3af;
          font-weight: 500;
        }

        .auth-switch-login .password-toggle {
          display: inline-flex;
          border: 0;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .auth-switch-login .password-toggle:hover {
          color: #334155;
        }

        .auth-switch-login .btn {
          width: 100%;
          max-width: 390px;
          border: none;
          outline: none;
          height: 50px;
          border-radius: 14px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 700;
          margin: 10px 0 0;
          cursor: pointer;
          transition: 0.3s;
          font-size: 0.86rem;
          letter-spacing: 0.05em;
          background: linear-gradient(120deg, #3866ff, #2eb9f5);
        }

        .auth-switch-login .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(56, 102, 255, 0.3);
        }

        .auth-switch-login .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .auth-switch-login .btn.ghost {
          margin-top: 10px;
          color: #111827;
          background: #ffffff;
          border: 1px solid #d1d5db;
          text-transform: none;
          letter-spacing: 0;
          font-size: 0.95rem;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .auth-switch-login .btn.ghost:hover {
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
        }

        .auth-switch-login .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .auth-switch-login .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          text-align: left;
          z-index: 6;
        }

        .auth-switch-login .left-panel {
          pointer-events: all;
          padding: 3rem 16% 2rem 11%;
        }

        .auth-switch-login .right-panel {
          pointer-events: none;
          padding: 3rem 11% 2rem 16%;
        }

        .auth-switch-login .panel .content {
          color: #ffffff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
          max-width: 280px;
        }

        .auth-switch-login .panel h3 {
          font-weight: 800;
          line-height: 1.1;
          font-size: 2rem;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .auth-switch-login .panel p {
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 24px;
          color: rgba(255, 255, 255, 0.9);
        }

        .auth-switch-login .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 22px;
        }

        .auth-switch-login .brand-mark {
          width: 28px;
          height: 28px;
          border-radius: 9px;
          background: #ffffff;
          color: #2f5bff;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .auth-switch-login .panel-switch-btn {
          margin: 0;
          background: none;
          border: 2px solid #ffffff;
          width: 140px;
          height: 42px;
          font-weight: 700;
          font-size: 0.82rem;
          color: #ffffff;
          border-radius: 999px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .auth-switch-login .panel-switch-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .auth-switch-login .right-panel .content {
          transform: translateX(800px);
        }

        .auth-switch-login .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-switch-login .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-switch-login .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-switch-login .container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-switch-login .container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch-login .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-switch-login .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-switch-login .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-switch-login .container:before {
          content: "";
          position: absolute;
          height: 1900px;
          width: 1900px;
          top: -12%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #315df7 0%, #2cb0f2 58%, #29d9a6 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .auth-switch-login .footer-note {
          margin-top: 12px;
          color: #9ca3af;
          font-size: 0.76rem;
        }

        @media (max-width: 900px) {
          .auth-switch-login .container {
            min-height: 860px;
            height: 100vh;
          }

          .auth-switch-login .signin-signup {
            width: 100%;
            top: 96%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }

          .auth-switch-login .signin-signup,
          .auth-switch-login .container.sign-up-mode .signin-signup {
            left: 50%;
          }

          .auth-switch-login .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }

          .auth-switch-login .panel {
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 2.2rem 8%;
            grid-column: 1 / 2;
            text-align: center;
          }

          .auth-switch-login .panel .content {
            max-width: 100%;
          }

          .auth-switch-login .right-panel {
            grid-row: 3 / 4;
          }

          .auth-switch-login .left-panel {
            grid-row: 1 / 2;
          }

          .auth-switch-login .right-panel .content {
            transform: translateY(300px);
          }

          .auth-switch-login .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }

          .auth-switch-login .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }

          .auth-switch-login .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }

          .auth-switch-login .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }

          .auth-switch-login .container.sign-up-mode .signin-signup {
            top: 4%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-switch-login form {
            padding: 0 1.3rem;
          }

          .auth-switch-login .title {
            font-size: 1.8rem;
          }

          .auth-switch-login .panel h3 {
            font-size: 1.45rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleLoginSubmit}>
              <h2 className="title">Sign in</h2>
              <p className="subtitle">Welcome back to your finance dashboard</p>

              <div className="input-field">
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="Email address"
                  autoComplete="email"
                />
              </div>

              <div className="input-field">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                >
                  {showLoginPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>

              <button type="button" className="btn ghost" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <p className="footer-note">&copy; 2025-2026 FinKart</p>
            </form>

            <form className="sign-up-form" onSubmit={handleSignupSubmit}>
              <h2 className="title">Create account</h2>
              <p className="subtitle">Start tracking your income and expenses today</p>

              <div className="input-field">
                <input
                  type="text"
                  name="name"
                  value={signupForm.name}
                  onChange={handleSignupChange}
                  placeholder="Full name"
                  maxLength={50}
                  autoComplete="name"
                />
              </div>

              <div className="input-field">
                <input
                  type="email"
                  name="email"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  placeholder="Email address"
                  autoComplete="email"
                />
              </div>

              <div className="input-field">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  placeholder="Password (min 8 chars)"
                  maxLength={72}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowSignupPassword((prev) => !prev)}
                >
                  {showSignupPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Creating Account...' : 'Sign Up'}
              </button>

              <button type="button" className="btn ghost" onClick={handleGoogleLogin}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <p className="footer-note">By continuing, you agree to our terms and privacy policy.</p>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <div className="brand">
                <span className="brand-mark">F</span>
                FinKart
              </div>
              <h3>New here?</h3>
              <p>Create an account and take control of budgets, expenses, lending, and saving goals in one place.</p>
              <button type="button" className="panel-switch-btn" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <div className="brand">
                <span className="brand-mark">F</span>
                FinKart
              </div>
              <h3>One of us?</h3>
              <p>Welcome back. Sign in and continue with your latest financial insights and activity.</p>
              <button type="button" className="panel-switch-btn" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
