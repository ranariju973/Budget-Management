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
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
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
