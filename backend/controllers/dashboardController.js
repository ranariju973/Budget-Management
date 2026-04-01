const { supabaseAdmin } = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');
const { mapToApi } = require('../utils/supabaseCrudFactory');

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

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Run all queries in parallel
    const [incomeResult, expensesResult, borrowsResult, lendsResult] = await Promise.all([
      supabaseAdmin
        .from('incomes')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('month', month)
        .eq('year', year)
        .single(),
      supabaseAdmin
        .from('expenses')
        .select('*')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false }),
      supabaseAdmin
        .from('borrows')
        .select('*')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false }),
      supabaseAdmin
        .from('lends')
        .select('*')
        .eq('user_id', req.user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false }),
    ]);

    const incomeDoc = incomeResult.data;
    const expenses = expensesResult.data || [];
    const borrows = borrowsResult.data || [];
    const lends = lendsResult.data || [];

    // Calculate totals
    const income = incomeDoc?.amount ? parseFloat(incomeDoc.amount) : 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalBorrowing = borrows.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalLent = lends.reduce((sum, l) => sum + parseFloat(l.amount), 0);
    const totalUnpaidLends = lends
      .filter((l) => !l.is_paid)
      .reduce((sum, l) => sum + parseFloat(l.amount), 0);

    // Borrows don't affect balance (paid borrows already created expenses)
    // Only unpaid lends subtract from balance
    const remainingBalance = income - totalExpenses - totalUnpaidLends;

    const fieldMapBL = { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' };

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
      income: incomeDoc ? mapToApi(incomeDoc) : null,
      expenses: expenses.map((e) => mapToApi(e)),
      borrows: borrows.map((b) => mapToApi(b, fieldMapBL)),
      lends: lends.map((l) => mapToApi(l, fieldMapBL)),
    });
  } catch (error) {
    handleError(res, error, 'Dashboard');
  }
};

module.exports = { getDashboardData };
