const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const {
  signup,
  login,
  getMe,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15d',
      algorithm: 'HS256',
    });

    // Use the first allowed origin as the frontend URL (or fallback to localhost:5173)
    let frontendUrl = 'http://localhost:5173';
    if (process.env.ALLOWED_ORIGINS) {
      frontendUrl = process.env.ALLOWED_ORIGINS.split(',')[0];
    }

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  }
);

module.exports = router;
