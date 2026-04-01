const { supabaseAdmin } = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');
const { mapToApi } = require('../utils/supabaseCrudFactory');

/**
 * Build a date-range filter for Supabase queries.
 * Returns { start, end } date strings or null.
 */
const buildDateFilter = ({ date, month, year, from, to }) => {
  // Exact date
  if (date) {
    return { start: date, end: date };
  }
  // Date range
  if (from || to) {
    return { start: from || null, end: to || null };
  }
  // Month + Year
  if (month && year) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const lastDay = new Date(y, m, 0).getDate();
    return {
      start: `${y}-${String(m).padStart(2, '0')}-01`,
      end: `${y}-${String(m).padStart(2, '0')}-${lastDay}`,
    };
  }
  // Year only
  if (year) {
    const y = parseInt(year, 10);
    return { start: `${y}-01-01`, end: `${y}-12-31` };
  }
  return null;
};

/**
 * @route   GET /api/search
 * @desc    Unified search across expenses, borrows, lends using Supabase.
 * @access  Private
 */
const search = async (req, res) => {
  try {
    const {
      q, date, month, year, from, to,
      type, page = 1, limit = 20, sort = 'date_desc',
    } = req.query;

    const userId = req.user.id;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Which collections to search
    const typeSet = type
      ? new Set(type.split(',').map((t) => t.trim().toLowerCase()))
      : new Set(['expense', 'borrow', 'lend']);

    const dateFilter = buildDateFilter({ date, month, year, from, to });

    const results = [];

    // Query expenses
    if (typeSet.has('expense')) {
      let query = supabaseAdmin.from('expenses').select('*').eq('user_id', userId);
      if (dateFilter) {
        if (dateFilter.start) query = query.gte('date', dateFilter.start);
        if (dateFilter.end) query = query.lte('date', dateFilter.end);
      }
      if (q) query = query.ilike('title', `%${q}%`);
      const { data } = await query;
      (data || []).forEach((item) => {
        results.push({
          ...mapToApi(item),
          _type: 'expense',
          _label: item.title,
        });
      });
    }

    // Query borrows
    if (typeSet.has('borrow')) {
      let query = supabaseAdmin.from('borrows').select('*').eq('user_id', userId);
      if (dateFilter) {
        if (dateFilter.start) query = query.gte('date', dateFilter.start);
        if (dateFilter.end) query = query.lte('date', dateFilter.end);
      }
      if (q) query = query.or(`person_name.ilike.%${q}%,reason.ilike.%${q}%`);
      const { data } = await query;
      (data || []).forEach((item) => {
        results.push({
          ...mapToApi(item, { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' }),
          _type: 'borrow',
          _label: item.person_name,
        });
      });
    }

    // Query lends
    if (typeSet.has('lend')) {
      let query = supabaseAdmin.from('lends').select('*').eq('user_id', userId);
      if (dateFilter) {
        if (dateFilter.start) query = query.gte('date', dateFilter.start);
        if (dateFilter.end) query = query.lte('date', dateFilter.end);
      }
      if (q) query = query.or(`person_name.ilike.%${q}%,reason.ilike.%${q}%`);
      const { data } = await query;
      (data || []).forEach((item) => {
        results.push({
          ...mapToApi(item, { personName: 'person_name', isPaid: 'is_paid', paidDate: 'paid_date' }),
          _type: 'lend',
          _label: item.person_name,
        });
      });
    }

    // Sort results
    const sortFn = {
      date_desc: (a, b) => new Date(b.date) - new Date(a.date),
      date_asc: (a, b) => new Date(a.date) - new Date(b.date),
      amount_desc: (a, b) => b.amount - a.amount,
      amount_asc: (a, b) => a.amount - b.amount,
    };
    results.sort(sortFn[sort] || sortFn.date_desc);

    // Paginate
    const total = results.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginatedResults = results.slice(offset, offset + limitNum);

    res.json({
      results: paginatedResults,
      pagination: { page: pageNum, limit: limitNum, total, totalPages },
    });
  } catch (error) {
    handleError(res, error, 'Search');
  }
};

/**
 * @route   GET /api/search/suggestions
 * @desc    Autocomplete suggestions
 * @access  Private
 */
const getSuggestions = async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const userId = req.user.id;
    const prefix = q.trim();
    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 8));

    const [expensesResult, borrowsResult, lendsResult] = await Promise.all([
      supabaseAdmin.from('expenses').select('title').eq('user_id', userId).ilike('title', `${prefix}%`),
      supabaseAdmin.from('borrows').select('person_name').eq('user_id', userId).ilike('person_name', `${prefix}%`),
      supabaseAdmin.from('lends').select('person_name').eq('user_id', userId).ilike('person_name', `${prefix}%`),
    ]);

    // Aggregate and count
    const countMap = {};
    (expensesResult.data || []).forEach((e) => {
      const key = e.title.toLowerCase();
      if (!countMap[key]) countMap[key] = { label: e.title, type: 'expense', count: 0 };
      countMap[key].count++;
    });
    (borrowsResult.data || []).forEach((b) => {
      const key = b.person_name.toLowerCase();
      if (!countMap[key]) countMap[key] = { label: b.person_name, type: 'borrow', count: 0 };
      countMap[key].count++;
    });
    (lendsResult.data || []).forEach((l) => {
      const key = l.person_name.toLowerCase();
      if (!countMap[key]) countMap[key] = { label: l.person_name, type: 'lend', count: 0 };
      countMap[key].count++;
    });

    const suggestions = Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum);

    res.json({ suggestions });
  } catch (error) {
    handleError(res, error, 'Search Suggestions');
  }
};

/**
 * @route   GET /api/search/recent
 * @desc    Get recent unique search terms from user's data
 * @access  Private
 */
const getRecentTerms = async (req, res) => {
  try {
    const userId = req.user.id;

    const [expensesResult, borrowsResult, lendsResult] = await Promise.all([
      supabaseAdmin.from('expenses').select('title').eq('user_id', userId).order('date', { ascending: false }).limit(20),
      supabaseAdmin.from('borrows').select('person_name').eq('user_id', userId).order('date', { ascending: false }).limit(20),
      supabaseAdmin.from('lends').select('person_name').eq('user_id', userId).order('date', { ascending: false }).limit(20),
    ]);

    const seen = new Set();
    const terms = [];

    const addTerm = (label, type) => {
      const key = label.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        terms.push({ label, type });
      }
    };

    (expensesResult.data || []).forEach((e) => addTerm(e.title, 'expense'));
    (borrowsResult.data || []).forEach((b) => addTerm(b.person_name, 'borrow'));
    (lendsResult.data || []).forEach((l) => addTerm(l.person_name, 'lend'));

    res.json({ terms: terms.slice(0, 10) });
  } catch (error) {
    handleError(res, error, 'Recent Terms');
  }
};

module.exports = { search, getSuggestions, getRecentTerms };
