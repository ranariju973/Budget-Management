const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');

// Generate JWT — long-lived token (15 days)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15d',
    algorithm: 'HS256',
  });
};

// Strict email validation
const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// Password strength check
const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !name.trim() || name.trim().length > 50) {
      return res.status(400).json({ message: 'Name is required (max 50 characters)' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, and a number',
      });
    }
    if (password.length > 72) {
      return res.status(400).json({ message: 'Password must be under 72 characters' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      })
      .select('id, name, email')
      .single();

    if (error) throw error;

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

/**
 * @desc    Login user & return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user with password
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, password')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    handleError(res, error, 'Auth');
  }
};

/**
 * @desc    Delete user account and all data
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user data (cascade should handle most, but explicit for safety)
    await Promise.all([
      supabaseAdmin.from('incomes').delete().eq('user_id', userId),
      supabaseAdmin.from('expenses').delete().eq('user_id', userId),
      supabaseAdmin.from('borrows').delete().eq('user_id', userId),
      supabaseAdmin.from('lends').delete().eq('user_id', userId),
      supabaseAdmin.from('budget_goals').delete().eq('user_id', userId),
    ]);

    // Anonymize user in split groups
    await supabaseAdmin
      .from('split_group_members')
      .update({ name: 'Deleted User', email: 'deleted@example.com' })
      .eq('user_id', userId);

    // Delete user
    await supabaseAdmin.from('users').delete().eq('id', userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Auth Account Delete');
  }
};

module.exports = {
  signup,
  login,
  getMe,
  deleteAccount,
};
