const { supabaseAdmin } = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');
const { mapToApi } = require('../utils/supabaseCrudFactory');

/**
 * @desc    Get all budget goals for a month
 * @route   GET /api/budget-goals
 * @access  Private
 */
const getBudgetGoals = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Run goals query and expense aggregation in parallel
    const [goalsResult, expensesResult] = await Promise.all([
      supabaseAdmin
        .from('budget_goals')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('month', month)
        .eq('year', year)
        .order('category', { ascending: true }),
      supabaseAdmin
        .from('expenses')
        .select('title, amount')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate),
    ]);

    if (goalsResult.error) throw goalsResult.error;
    if (expensesResult.error) throw expensesResult.error;

    // Aggregate expenses by title in JavaScript
    const spendingMap = {};
    expensesResult.data.forEach((expense) => {
      spendingMap[expense.title] = (spendingMap[expense.title] || 0) + parseFloat(expense.amount);
    });

    const goalsWithSpending = goalsResult.data.map((goal) => {
      const spent = spendingMap[goal.category] || 0;
      return {
        _id: goal.id,
        id: goal.id,
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

    // Upsert: try to update existing, if not found, insert
    const { data: existing } = await supabaseAdmin
      .from('budget_goals')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('category', category)
      .eq('month', month)
      .eq('year', year)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('budget_goals')
        .update({ limit: parseFloat(limit) })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('budget_goals')
        .insert({
          user_id: req.user.id,
          category,
          limit: parseFloat(limit),
          month: parseInt(month),
          year: parseInt(year),
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.status(201).json(mapToApi(result));
  } catch (error) {
    if (error.code === '23505') {
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
    if (limit !== undefined) updateFields.limit = parseFloat(limit);

    const { data, error } = await supabaseAdmin
      .from('budget_goals')
      .update(updateFields)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Goal not found' });
      }
      throw error;
    }

    res.json(mapToApi(data));
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
    const { data, error } = await supabaseAdmin
      .from('budget_goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Goal not found' });
    }

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

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data: expenses, error } = await supabaseAdmin
      .from('expenses')
      .select('title, amount, date')
      .eq('user_id', req.user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // Category breakdown
    const categoryMap = {};
    const dailyMap = {};

    expenses.forEach((expense) => {
      // Category aggregation
      if (!categoryMap[expense.title]) {
        categoryMap[expense.title] = { total: 0, count: 0 };
      }
      categoryMap[expense.title].total += parseFloat(expense.amount);
      categoryMap[expense.title].count += 1;

      // Daily aggregation
      const day = new Date(expense.date).getDate();
      dailyMap[day] = (dailyMap[day] || 0) + parseFloat(expense.amount);
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, data]) => ({ category, total: data.total, count: data.count }))
      .sort((a, b) => b.total - a.total);

    const dailyTrend = Object.entries(dailyMap)
      .map(([day, total]) => ({ day: parseInt(day), total }))
      .sort((a, b) => a.day - b.day);

    res.json({ categoryBreakdown, dailyTrend });
  } catch (error) {
    handleError(res, error, 'BudgetGoal');
  }
};

module.exports = { getBudgetGoals, createBudgetGoal, updateBudgetGoal, deleteBudgetGoal, getChartData };
