const Income = require('../models/Income');
const { handleError } = require('../utils/errorHandler');

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

    const income = await Income.find(query).sort({ year: -1, month: -1 }).lean();
    res.json(income);
  } catch (error) {
    handleError(res, error, 'Income');
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

    const income = await Income.findOneAndUpdate(
      { userId: req.user._id, month, year },
      { amount },
      { returnDocument: 'after', upsert: true, runValidators: true }
    ).lean();

    res.status(201).json(income);
  } catch (error) {
    handleError(res, error, 'Income');
  }
};

/**
 * @desc    Update income by ID
 * @route   PUT /api/income/:id
 * @access  Private
 */
const updateIncome = async (req, res) => {
  try {
    const updated = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount: req.body.amount },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(updated);
  } catch (error) {
    handleError(res, error, 'Income');
  }
};

module.exports = { getIncome, createIncome, updateIncome };
