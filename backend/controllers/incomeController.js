const Income = require('../models/Income');

/**
 * @desc    Get income for user (filter by month/year)
 * @route   GET /api/income
 * @access  Private
 */
const getIncome = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user._id };

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const income = await Income.find(query).sort({ year: -1, month: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Create or upsert income for a month/year
 * @route   POST /api/income
 * @access  Private
 */
const createIncome = async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    if (!amount || !month || !year) {
      return res.status(400).json({ message: 'Amount, month, and year are required' });
    }

    // Upsert: create if not exists, update if exists
    const income = await Income.findOneAndUpdate(
      { userId: req.user._id, month, year },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update income by ID
 * @route   PUT /api/income/:id
 * @access  Private
 */
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Verify ownership
    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    income.amount = req.body.amount ?? income.amount;
    const updated = await income.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getIncome, createIncome, updateIncome };
