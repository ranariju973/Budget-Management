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
 * Balance formula:
 *  - Borrows do NOT affect balance (unpaid borrows are just tracked;
 *    paid borrows already created an expense via markAsPaid)
 *  - Lends subtract from balance when unpaid; when marked as paid,
 *    the amount is credited back
 *  - Formula: income - totalExpenses - totalUnpaidLends
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

    // Run all queries in parallel
    const [
      incomeDoc,
      expenseAgg,
      borrowAgg,
      lendAgg,
      unpaidLendAgg,
      expenses,
      borrows,
      lends,
    ] = await Promise.all([
      Income.findOne({ userId: req.user._id, month, year }).lean(),
      Expense.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Borrow.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Lend.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Lend.aggregate([{ $match: { ...dateFilter, isPaid: { $ne: true } } }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Expense.find(dateFilter).sort({ date: -1 }).lean(),
      Borrow.find(dateFilter).sort({ date: -1 }).lean(),
      Lend.find(dateFilter).sort({ date: -1 }).lean(),
    ]);

    const income = incomeDoc?.amount || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalBorrowing = borrowAgg[0]?.total || 0;
    const totalLent = lendAgg[0]?.total || 0;
    const totalUnpaidLends = unpaidLendAgg[0]?.total || 0;

    // Borrows don't affect balance (paid borrows already created expenses)
    // Only unpaid lends subtract from balance
    const remainingBalance = income - totalExpenses - totalUnpaidLends;

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
