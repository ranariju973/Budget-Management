const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Borrow = require('../models/Borrow');
const Lend = require('../models/Lend');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Get financial summary for user (month/year)
 * @route   GET /api/summary
 * @access  Private
 *
 * Balance formula:
 *  - Borrows do NOT affect balance
 *  - Unpaid lends subtract from balance; paid lends are credited back
 *  - Formula: income - totalExpenses - totalUnpaidLends
 */
const getSummary = async (req, res) => {
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

    const [incomeDoc, expenseAgg, borrowAgg, lendAgg, unpaidLendAgg] = await Promise.all([
      Income.findOne({ userId: req.user._id, month, year }).lean(),
      Expense.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Borrow.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Lend.aggregate([{ $match: dateFilter }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
      Lend.aggregate([{ $match: { ...dateFilter, isPaid: { $ne: true } } }, ...sumPipeline]).option({ maxTimeMS: 5000 }),
    ]);

    const income = incomeDoc?.amount || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalBorrowing = borrowAgg[0]?.total || 0;
    const totalLent = lendAgg[0]?.total || 0;
    const totalUnpaidLends = unpaidLendAgg[0]?.total || 0;

    // Borrows don't affect balance; only unpaid lends subtract
    const remainingBalance = income - totalExpenses - totalUnpaidLends;

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
    handleError(res, error, 'Summary');
  }
};

module.exports = { getSummary };
