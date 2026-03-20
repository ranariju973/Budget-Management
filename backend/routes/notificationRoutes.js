const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/notifications/vapidPublicKey
// @desc    Get the VAPID public key
// @access  Public
router.get('/vapidPublicKey', (req, res) => {
  res.status(200).json({
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// @route   POST /api/notifications/subscribe
// @desc    Subscribe a device to push notifications
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
  try {
    const subscription = req.body;
    
    // Validate subscription payload
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the subscription endpoint already exists for this user to avoid duplicates
    const existingSub = user.pushSubscriptions.find(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!existingSub) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(201).json({ message: 'Subscription added successfully' });
  } catch (error) {
    console.error('Push Subscription Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
