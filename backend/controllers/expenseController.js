const Expense = require('../models/Expense');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Get all expenses for user (optionally filter by month/year)
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { userId: req.user._id };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();
    res.json(expenses);
  } catch (error) {
    handleError(res, error, 'Expense');
  }
};

/**
 * @desc    Add an expense
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = async (req, res) => {
  try {
    const { title, amount, date } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ message: 'Title, amount, and date are required' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      date,
    });

    res.status(201).json(expense);
  } catch (error) {
    handleError(res, error, 'Expense');
  }
};

/**
 * @desc    Update an expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = async (req, res) => {
  try {
    const { title, amount, date } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (amount !== undefined) updateFields.amount = amount;
    if (date !== undefined) updateFields.date = date;

    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updated);
  } catch (error) {
    handleError(res, error, 'Expense');
  }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Expense');
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
