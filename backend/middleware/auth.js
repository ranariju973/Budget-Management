const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

/**
 * JWT Authentication Middleware (Supabase version)
 * Extracts token from Authorization header, verifies it,
 * and attaches user to request object.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, google_id, push_subscriptions, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Map to API format for compatibility
    req.user = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      googleId: user.google_id,
      pushSubscriptions: user.push_subscriptions || [],
      createdAt: user.created_at,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
