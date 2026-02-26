const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Borrow = require('../models/Borrow');
const Lend = require('../models/Lend');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Batched dashboard data — single endpoint replaces 5 separate API calls
 * @route   GET /api/dashboard
 * @access  Private
 *
 * Architecture:
 *  - Runs all 5 queries in parallel via Promise.all (same as before, but 1 HTTP request)
 *  - Uses HashMap (Object.create(null)) for O(1) spending lookups
 *  - maxTimeMS guards prevent runaway aggregations
 *  - Returns: { summary, income, expenses, borrows, lends }
 *
 * Time: O(1) HTTP round-trip × O(k) per-collection scans where k = matching docs
 */
const getDashboardData = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const dateFilter = {
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    };

    const sumPipeline = [{ $group: { _id: null, total: { $sum: '$amount' } } }];

    // Run all 6 queries in parallel — O(1) network round-trips
    const [
      incomeDoc,
      expenseAgg,
      borrowAgg,
      lendAgg,
      expenses,
      borrows,
      lends,
    ] = await Promise.all([
      Income.findOne({ userId: req.user._id, month, year }).lean(),
      Expense.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Borrow.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Lend.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Expense.find(dateFilter).sort({ date: -1 }).lean(),
      Borrow.find(dateFilter).sort({ date: -1 }).lean(),
      Lend.find(dateFilter).sort({ date: -1 }).lean(),
    ]);

    const income = incomeDoc?.amount || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalBorrowing = borrowAgg[0]?.total || 0;
    const totalLent = lendAgg[0]?.total || 0;
    // Borrow = money received (adds to balance), Lend = money given (subtracts)
    const remainingBalance = income - totalExpenses + totalBorrowing - totalLent;

    res.json({
      summary: {
        month,
        year,
        income,
        totalExpenses,
        totalBorrowing,
        totalLent,
        remainingBalance,
      },
      income: incomeDoc,
      expenses,
      borrows,
      lends,
    });
  } catch (error) {
    handleError(res, error, 'Dashboard');
  }
};

module.exports = { getDashboardData };
