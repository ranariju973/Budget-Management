const BudgetGoal = require('../models/BudgetGoal');
const Expense = require('../models/Expense');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Get all budget goals for a month
 * @route   GET /api/budget-goals
 * @access  Private
 */
const getBudgetGoals = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Run goals query and expense aggregation in parallel
    const [goals, expenseAgg] = await Promise.all([
      BudgetGoal.find({ userId: req.user._id, month, year }).sort({ category: 1 }).lean(),
      Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: '$title', total: { $sum: '$amount' } } },
      ]),
    ]);

    const spendingMap = {};
    expenseAgg.forEach((item) => {
      spendingMap[item._id] = item.total;
    });

    const goalsWithSpending = goals.map((goal) => {
      const spent = spendingMap[goal.category] || 0;
      return {
        _id: goal._id,
        category: goal.category,
        limit: goal.limit,
        spent,
        month: goal.month,
        year: goal.year,
        exceeded: spent > goal.limit,
        percentage: goal.limit > 0 ? Math.round((spent / goal.limit) * 100) : 0,
      };
    });

    res.json(goalsWithSpending);
  } catch (error) {
    handleError(res, error, 'BudgetGoal');
  }
};

/**
 * @desc    Create or update a budget goal
 * @route   POST /api/budget-goals
 * @access  Private
 */
const createBudgetGoal = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit || !month || !year) {
      return res.status(400).json({ message: 'Category, limit, month, and year are required' });
    }

    const goal = await BudgetGoal.findOneAndUpdate(
      { userId: req.user._id, category, month, year },
      { limit },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    res.status(201).json(goal);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Budget goal for this category already exists' });
    }
    handleError(res, error, 'BudgetGoal');
  }
};

/**
 * @desc    Update a budget goal
 * @route   PUT /api/budget-goals/:id
 * @access  Private
 */
const updateBudgetGoal = async (req, res) => {
  try {
    const { category, limit } = req.body;
    const updateFields = {};
    if (category !== undefined) updateFields.category = category;
    if (limit !== undefined) updateFields.limit = limit;

    const updated = await BudgetGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.json(updated);
  } catch (error) {
    handleError(res, error, 'BudgetGoal');
  }
};

/**
 * @desc    Delete a budget goal
 * @route   DELETE /api/budget-goals/:id
 * @access  Private
 */
const deleteBudgetGoal = async (req, res) => {
  try {
    const deleted = await BudgetGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    handleError(res, error, 'BudgetGoal');
  }
};

/**
 * @desc    Get spending breakdown for charts
 * @route   GET /api/budget-goals/chart-data
 * @access  Private
 */
const getChartData = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Run both aggregations in parallel
    const [categoryBreakdown, dailyTrend] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$title',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      categoryBreakdown: categoryBreakdown.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      dailyTrend: dailyTrend.map((item) => ({
        day: item._id,
        total: item.total,
      })),
    });
  } catch (error) {
    handleError(res, error, 'BudgetGoal');
  }
};

module.exports = { getBudgetGoals, createBudgetGoal, updateBudgetGoal, deleteBudgetGoal, getChartData };
