const { supabaseAdmin } = require('../config/supabase');
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

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const [incomeResult, expensesResult, borrowsResult, lendsResult] = await Promise.all([
      supabaseAdmin
        .from('incomes')
        .select('amount')
        .eq('user_id', req.user.id)
        .eq('month', month)
        .eq('year', year)
        .single(),
      supabaseAdmin
        .from('expenses')
        .select('amount')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate),
      supabaseAdmin
        .from('borrows')
        .select('amount')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate),
      supabaseAdmin
        .from('lends')
        .select('amount, is_paid')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate),
    ]);

    const income = incomeResult.data?.amount ? parseFloat(incomeResult.data.amount) : 0;
    const totalExpenses = (expensesResult.data || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalBorrowing = (borrowsResult.data || []).reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalLent = (lendsResult.data || []).reduce((sum, l) => sum + parseFloat(l.amount), 0);
    const totalUnpaidLends = (lendsResult.data || [])
      .filter((l) => !l.is_paid)
      .reduce((sum, l) => sum + parseFloat(l.amount), 0);

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
