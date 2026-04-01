const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user (trim name to prevent whitespace abuse)
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    // Never expose internal error details to client
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

    // Find user — explicitly select password (hidden by default in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
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
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    handleError(res, error, 'Auth');
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // We need to require models here to prevent circular dependency issues if not already required
    const Income = require('../models/Income');
    const Expense = require('../models/Expense');
    const Borrow = require('../models/Borrow');
    const Lend = require('../models/Lend');
    const BudgetGoal = require('../models/BudgetGoal');
    const SplitGroup = require('../models/SplitGroup');

    // Delete personal tracking data
    await Income.deleteMany({ userId });
    await Expense.deleteMany({ userId });
    await Borrow.deleteMany({ userId });
    await Lend.deleteMany({ userId });
    await BudgetGoal.deleteMany({ userId });

    // Anonymize user in SplitGroups to preserve mathematical integrity
    await SplitGroup.updateMany(
      { 'members.userId': userId },
      { 
        $set: { 
          'members.$[elem].name': 'Deleted User',
          'members.$[elem].email': 'deleted@example.com'
        } 
      },
      {
        arrayFilters: [{ 'elem.userId': userId }]
      }
    );

    // Hard delete the user
    await User.findByIdAndDelete(userId);

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
