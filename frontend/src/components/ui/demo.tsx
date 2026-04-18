"use client";

import React, { useEffect, useState } from 'react';
import { ChartNoAxesColumn, Globe, Landmark, Lock, Mail, Sparkles, User } from 'lucide-react';

export default function AuthSwitch() {
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.auth-switch-demo .container');
    if (!container) return;

    if (isSignUp) container.classList.add('sign-up-mode');
    else container.classList.remove('sign-up-mode');
  }, [isSignUp]);

  return (
    <div className="auth-switch-demo">
      <style>{`
        .auth-switch-demo,
        .auth-switch-demo * {
          box-sizing: border-box;
        }

        .auth-switch-demo {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-switch-demo .container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .auth-switch-demo .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .auth-switch-demo .signin-signup {
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

        .auth-switch-demo form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .auth-switch-demo form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch-demo form.sign-in-form {
          z-index: 2;
        }

        .auth-switch-demo .title {
          font-size: 2.2rem;
          color: #444;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .auth-switch-demo .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f0f0f0;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 56px 1fr;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
        }

        .auth-switch-demo .input-field:focus-within {
          background-color: #e8e8e8;
          box-shadow: 0 0 0 2px #667eea;
        }

        .auth-switch-demo .input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .auth-switch-demo .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          width: 100%;
        }

        .auth-switch-demo .input-field input::placeholder {
          color: #aaa;
          font-weight: 400;
        }

        .auth-switch-demo .btn {
          width: 150px;
          background-color: #667eea;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.9rem;
        }

        .auth-switch-demo .btn:hover {
          background-color: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .auth-switch-demo .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .auth-switch-demo .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .auth-switch-demo .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .auth-switch-demo .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .auth-switch-demo .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .auth-switch-demo .panel h3 {
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .auth-switch-demo .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
        }

        .auth-switch-demo .panel-image {
          margin-top: 8px;
          width: 100%;
          max-width: 220px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          object-fit: cover;
          aspect-ratio: 4 / 3;
        }

        .auth-switch-demo .btn.transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .auth-switch-demo .btn.transparent:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .auth-switch-demo .right-panel .content {
          transform: translateX(800px);
        }

        .auth-switch-demo .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .auth-switch-demo .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-switch-demo .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-switch-demo .container.sign-up-mode form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-switch-demo .container.sign-up-mode form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-switch-demo .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .auth-switch-demo .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-switch-demo .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .auth-switch-demo .container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #667eea 0%, #764ba2 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .auth-switch-demo .social-text {
          padding: 0.7rem 0;
          font-size: 1rem;
          color: #666;
        }

        .auth-switch-demo .social-media {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .auth-switch-demo .social-icon {
          height: 46px;
          width: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 50%;
          color: #667eea;
          transition: 0.3s;
          cursor: pointer;
        }

        .auth-switch-demo .social-icon:hover {
          border-color: #764ba2;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 870px) {
          .auth-switch-demo .container {
            min-height: 800px;
            height: 100vh;
          }

          .auth-switch-demo .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }

          .auth-switch-demo .signin-signup,
          .auth-switch-demo .container.sign-up-mode .signin-signup {
            left: 50%;
          }

          .auth-switch-demo .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }

          .auth-switch-demo .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }

          .auth-switch-demo .right-panel {
            grid-row: 3 / 4;
          }

          .auth-switch-demo .left-panel {
            grid-row: 1 / 2;
          }

          .auth-switch-demo .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }

          .auth-switch-demo .panel h3 {
            font-size: 1.2rem;
          }

          .auth-switch-demo .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }

          .auth-switch-demo .panel-image {
            display: none;
          }

          .auth-switch-demo .btn.transparent {
            width: 110px;
            height: 35px;
            font-size: 0.7rem;
          }

          .auth-switch-demo .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }

          .auth-switch-demo .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }

          .auth-switch-demo .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }

          .auth-switch-demo .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }

          .auth-switch-demo .right-panel .content {
            transform: translateY(300px);
          }

          .auth-switch-demo .container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-switch-demo form {
            padding: 0 1.5rem;
          }

          .auth-switch-demo .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={(e) => e.preventDefault()}>
              <h2 className="title">Sign in</h2>
              <div className="input-field">
                <span className="input-icon">
                  <Mail size={18} />
                </span>
                <input type="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <span className="input-icon">
                  <Lock size={18} />
                </span>
                <input type="password" placeholder="Password" />
              </div>
              <input type="submit" value="Login" className="btn solid" />
              <p className="social-text">Or sign in with social platforms</p>
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>

            <form className="sign-up-form" onSubmit={(e) => e.preventDefault()}>
              <h2 className="title">Sign up</h2>
              <div className="input-field">
                <span className="input-icon">
                  <User size={18} />
                </span>
                <input type="text" placeholder="Username" />
              </div>
              <div className="input-field">
                <span className="input-icon">
                  <Mail size={18} />
                </span>
                <input type="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <span className="input-icon">
                  <Lock size={18} />
                </span>
                <input type="password" placeholder="Password" />
              </div>
              <input type="submit" value="Sign up" className="btn" />
              <p className="social-text">Or sign up with social platforms</p>
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
              <img
                className="panel-image"
                src="https://images.unsplash.com/photo-1554224154-26032cdcba7d?auto=format&fit=crop&w=800&q=80"
                alt="Person planning monthly budget"
              />
              <button type="button" className="btn transparent" onClick={() => setIsSignUp(true)}>
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <img
                className="panel-image"
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"
                alt="Laptop dashboard with analytics"
              />
              <button type="button" className="btn transparent" onClick={() => setIsSignUp(false)}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIcons() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <a href="#" className="social-icon" onClick={handleClick} aria-label="Continue with Google">
        <Globe size={20} />
      </a>
      <a href="#" className="social-icon" onClick={handleClick} aria-label="Continue with Bank">
        <Landmark size={20} />
      </a>
      <a href="#" className="social-icon" onClick={handleClick} aria-label="Continue with Analytics">
        <ChartNoAxesColumn size={20} />
      </a>
      <a href="#" className="social-icon" onClick={handleClick} aria-label="Continue with Premium">
        <Sparkles size={20} />
      </a>
    </>
  );
}
