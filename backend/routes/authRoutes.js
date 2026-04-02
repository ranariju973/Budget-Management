const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const {
  signup,
  login,
  getMe,
  deleteAccount,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.delete('/account', protect, deleteAccount);

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    passport.authenticate('google', { 
      scope: ['profile', 'email'], 
      session: false,
      state: req.query.source || 'web' // Record the source to branch redirect later
    })(req, res, next);
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token (user.id is Supabase UUID)
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15d',
      algorithm: 'HS256',
    });

    // Redirect to custom scheme immediately if initiated from native Android App
    if (req.query.state === 'app') {
      return res.redirect(`finkart://auth-callback?token=${token}`);
    }

    // Prefer explicit FRONTEND_URL, fallback to the first allowed origin, or localhost
    let frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      frontendUrl = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')[0] 
        : 'http://localhost:5173';
    }

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  }
);

module.exports = router;
