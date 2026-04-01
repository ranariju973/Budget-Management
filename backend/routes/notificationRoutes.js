const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

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

    // Get current user's push subscriptions
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, push_subscriptions')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentSubs = user.push_subscriptions || [];

    // Check if the subscription endpoint already exists to avoid duplicates
    const existingSub = currentSubs.find((sub) => sub.endpoint === subscription.endpoint);

    if (!existingSub) {
      const updatedSubs = [...currentSubs, subscription];
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ push_subscriptions: updatedSubs })
        .eq('id', req.user.id);

      if (updateError) throw updateError;
    }

    res.status(201).json({ message: 'Subscription added successfully' });
  } catch (error) {
    console.error('Push Subscription Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
