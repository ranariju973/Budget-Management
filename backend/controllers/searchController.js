const Expense = require('../models/Expense');
const Borrow = require('../models/Borrow');
const Lend = require('../models/Lend');
const { handleError } = require('../utils/errorHandler');

/**
 * Build a date-range filter for MongoDB queries.
 * Supports: exact date, month+year, year-only, or date range (from/to).
 */
const buildDateFilter = ({ date, month, year, from, to }) => {
  // Exact date
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { $gte: start, $lt: end };
  }
  // Date range
  if (from || to) {
    const filter = {};
    if (from) filter.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setDate(endDate.getDate() + 1);
      filter.$lt = endDate;
    }
    return filter;
  }
  // Month + Year
  if (month && year) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    return { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }
  // Year only
  if (year) {
    const y = parseInt(year, 10);
    return { $gte: new Date(y, 0, 1), $lt: new Date(y + 1, 0, 1) };
  }
  return null;
};

/**
 * Binary search helper — find insertion index in a sorted-by-date (desc) array.
 * Used to efficiently merge results from multiple collections while maintaining
 * sort order, similar to merge phase of merge-sort with O(log n) insertions.
 */
const binaryInsert = (sortedArr, item) => {
  let lo = 0;
  let hi = sortedArr.length;
  const itemTime = new Date(item.date).getTime();
  while (lo < hi) {
    const mid = (lo + hi) >>> 1; // unsigned right shift — safe integer division
    if (new Date(sortedArr[mid].date).getTime() > itemTime) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  sortedArr.splice(lo, 0, item);
};

/**
 * Merge multiple pre-sorted (desc by date) arrays into one sorted array.
 * Uses a k-way merge approach: start with the largest array, binary-insert others.
 * Time: O(N log N) where N = total items. Better than concat+sort for pre-sorted data.
 */
const kWayMerge = (arrays) => {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  // Find index of the largest array
  let largestIdx = 0;
  for (let i = 1; i < arrays.length; i++) {
    if (arrays[i].length > arrays[largestIdx].length) largestIdx = i;
  }

  // Start with a copy of the largest array
  const merged = [...arrays[largestIdx]];

  // Binary-insert items from all other arrays
  for (let i = 0; i < arrays.length; i++) {
    if (i === largestIdx || arrays[i].length === 0) continue;
    for (const item of arrays[i]) {
      binaryInsert(merged, item);
    }
  }
  return merged;
};

/**
 * @route   GET /api/search
 * @desc    Unified search across expenses, borrows, lends
 * @access  Private
 *
 * Query params:
 *   q        — text query (name / title)
 *   date     — exact date (YYYY-MM-DD)
 *   month    — month number (1-12)
 *   year     — year (e.g. 2026)
 *   from     — range start (YYYY-MM-DD)
 *   to       — range end (YYYY-MM-DD)
 *   type     — filter by collection: expense | borrow | lend (comma-sep, default: all)
 *   page     — pagination page (default: 1)
 *   limit    — results per page (default: 20, max: 100)
 *   sort     — date_asc | date_desc | amount_asc | amount_desc (default: date_desc)
 */
const search = async (req, res) => {
  try {
    const {
      q, date, month, year, from, to,
      type, page = 1, limit = 20, sort = 'date_desc',
    } = req.query;

    const userId = req.user._id;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    // ─── Build shared query filter ───────────────────────────
    const baseFilter = { userId };

    // Date filter
    const dateFilter = buildDateFilter({ date, month, year, from, to });
    if (dateFilter) baseFilter.date = dateFilter;

    // Sort
    const sortMap = {
      date_desc: { date: -1 },
      date_asc: { date: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 },
    };
    const sortOrder = sortMap[sort] || { date: -1 };

    // Which collections to search
    const types = type
      ? type.split(',').map((t) => t.trim().toLowerCase())
      : ['expense', 'borrow', 'lend'];

    // ─── Build per-collection queries ────────────────────────
    const queries = [];

    if (types.includes('expense')) {
      const expFilter = { ...baseFilter };
      if (q) {
        // Use regex for partial match (like YouTube suggestions)
        expFilter.title = { $regex: q, $options: 'i' };
      }
      queries.push(
        Expense.find(expFilter).sort(sortOrder).lean()
          .then((docs) => docs.map((d) => ({ ...d, _type: 'expense', _label: d.title })))
      );
    }

    if (types.includes('borrow')) {
      const borFilter = { ...baseFilter };
      if (q) {
        borFilter.$or = [
          { personName: { $regex: q, $options: 'i' } },
          { reason: { $regex: q, $options: 'i' } },
        ];
      }
      queries.push(
        Borrow.find(borFilter).sort(sortOrder).lean()
          .then((docs) => docs.map((d) => ({ ...d, _type: 'borrow', _label: d.personName })))
      );
    }

    if (types.includes('lend')) {
      const lndFilter = { ...baseFilter };
      if (q) {
        lndFilter.$or = [
          { personName: { $regex: q, $options: 'i' } },
          { reason: { $regex: q, $options: 'i' } },
        ];
      }
      queries.push(
        Lend.find(lndFilter).sort(sortOrder).lean()
          .then((docs) => docs.map((d) => ({ ...d, _type: 'lend', _label: d.personName })))
      );
    }

    // ─── Execute in parallel ─────────────────────────────────
    const results = await Promise.all(queries);

    // ─── K-way merge (each array is already sorted by sortOrder) ──
    const merged = kWayMerge(results);

    // ─── Pagination ──────────────────────────────────────────
    const total = merged.length;
    const totalPages = Math.ceil(total / limitNum);
    const start = (pageNum - 1) * limitNum;
    const paginated = merged.slice(start, start + limitNum);

    res.json({
      results: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    handleError(res, error, 'Search');
  }
};

/**
 * @route   GET /api/search/suggestions
 * @desc    Autocomplete suggestions (like YouTube search bar)
 * @access  Private
 *
 * Returns unique names/titles matching prefix, using MongoDB's
 * aggregation pipeline with $match + $group for server-side dedup.
 * Results are ranked by frequency (most common first).
 *
 * Query params:
 *   q      — prefix to match (min 1 char)
 *   limit  — max suggestions (default: 8)
 */
const getSuggestions = async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const userId = req.user._id;
    const prefix = q.trim();
    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 8));
    const regex = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Run aggregation pipelines in parallel across all collections
    const [expSuggestions, borNameSuggestions, lndNameSuggestions] = await Promise.all([
      // Expense titles matching prefix
      Expense.aggregate([
        { $match: { userId, title: regex } },
        { $group: { _id: { $toLower: '$title' }, label: { $first: '$title' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limitNum },
        { $project: { _id: 0, label: 1, type: { $literal: 'expense' }, count: 1 } },
      ]),
      // Borrow person names matching prefix
      Borrow.aggregate([
        { $match: { userId, personName: regex } },
        { $group: { _id: { $toLower: '$personName' }, label: { $first: '$personName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limitNum },
        { $project: { _id: 0, label: 1, type: { $literal: 'borrow' }, count: 1 } },
      ]),
      // Lend person names matching prefix
      Lend.aggregate([
        { $match: { userId, personName: regex } },
        { $group: { _id: { $toLower: '$personName' }, label: { $first: '$personName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limitNum },
        { $project: { _id: 0, label: 1, type: { $literal: 'lend' }, count: 1 } },
      ]),
    ]);

    // Merge and sort by frequency (most used first), then limit
    const all = [...expSuggestions, ...borNameSuggestions, ...lndNameSuggestions]
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum);

    res.json({ suggestions: all });
  } catch (error) {
    handleError(res, error, 'Search Suggestions');
  }
};

/**
 * @route   GET /api/search/recent
 * @desc    Get recent unique search terms from user's data (for initial suggestions)
 * @access  Private
 */
const getRecentTerms = async (req, res) => {
  try {
    const userId = req.user._id;

    const [recentExpenses, recentBorrows, recentLends] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }).limit(20).select('title').lean(),
      Borrow.find({ userId }).sort({ date: -1 }).limit(20).select('personName').lean(),
      Lend.find({ userId }).sort({ date: -1 }).limit(20).select('personName').lean(),
    ]);

    // Deduplicate using a Set-like approach (case-insensitive)
    const seen = new Set();
    const terms = [];

    const addTerm = (label, type) => {
      const key = label.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        terms.push({ label, type });
      }
    };

    recentExpenses.forEach((e) => addTerm(e.title, 'expense'));
    recentBorrows.forEach((b) => addTerm(b.personName, 'borrow'));
    recentLends.forEach((l) => addTerm(l.personName, 'lend'));

    res.json({ terms: terms.slice(0, 10) });
  } catch (error) {
    handleError(res, error, 'Recent Terms');
  }
};

module.exports = { search, getSuggestions, getRecentTerms };
