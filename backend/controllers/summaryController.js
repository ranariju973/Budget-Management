const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Borrow = require('../models/Borrow');
const Lend = require('../models/Lend');

/**
 * @desc    Get financial summary for user (month/year)
 * @route   GET /api/summary
 * @access  Private
 */
const getSummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get income for the month
    const incomeDoc = await Income.findOne({
      userId: req.user._id,
      month,
      year,
    });
    const income = incomeDoc ? incomeDoc.amount : 0;

    // Date range for aggregation
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const dateFilter = {
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    };

    // Aggregate total expenses
    const expenseAgg = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    // Aggregate total borrowing
    const borrowAgg = await Borrow.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalBorrowing = borrowAgg.length > 0 ? borrowAgg[0].total : 0;

    // Aggregate total lending
    const lendAgg = await Lend.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalLent = lendAgg.length > 0 ? lendAgg[0].total : 0;

    // Calculate remaining balance
    const remainingBalance = income - totalExpenses - totalBorrowing + totalLent;

    res.json({
      month,
      year,
      income,
      totalExpenses,
      totalBorrowing,
      totalLent,
      remainingBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSummary };
