const mongoose = require('mongoose');
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
 * @desc    Unified search across expenses, borrows, lends using server-side pagination.
 * @access  Private
 *
 * Architecture:
 *  - Uses MongoDB $unionWith aggregation to merge collections server-side
 *  - $sort + $skip + $limit run on the DB server → only transfers the requested page
 *  - Eliminates the previous in-memory kWayMerge + slice approach
 *  - Time: O(N log N) on DB server (indexed), O(page_size) memory in Node.js
 *
 * Query params:
 *   q, date, month, year, from, to, type, page, limit, sort
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

    // Sort mapping
    const sortMap = {
      date_desc: { date: -1 },
      date_asc: { date: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 },
    };
    const sortOrder = sortMap[sort] || { date: -1 };

    // Which collections to search (O(1) Set lookup)
    const typeSet = type
      ? new Set(type.split(',').map((t) => t.trim().toLowerCase()))
      : new Set(['expense', 'borrow', 'lend']);

    // ─── Build per-collection match filters ──────────────────
    const buildExpenseMatch = () => {
      const match = { userId: new mongoose.Types.ObjectId(userId) };
      const dateF = buildDateFilter({ date, month, year, from, to });
      if (dateF) match.date = dateF;
      if (q) match.title = { $regex: q, $options: 'i' };
      return match;
    };

    const buildPersonMatch = () => {
      const match = { userId: new mongoose.Types.ObjectId(userId) };
      const dateF = buildDateFilter({ date, month, year, from, to });
      if (dateF) match.date = dateF;
      if (q) {
        match.$or = [
          { personName: { $regex: q, $options: 'i' } },
          { reason: { $regex: q, $options: 'i' } },
        ];
      }
      return match;
    };

    // ─── Server-side aggregation with $unionWith ─────────────
    // Strategy: run count + page queries in parallel for efficiency
    // Each collection projects a common shape { _type, _label, amount, date, ... }

    const pipelines = [];

    // Start with the first active collection, $unionWith the rest
    if (typeSet.has('expense')) {
      pipelines.push({
        collection: 'expenses',
        match: buildExpenseMatch(),
        project: {
          _type: { $literal: 'expense' },
          _label: '$title',
          title: 1, amount: 1, date: 1, userId: 1,
        },
      });
    }
    if (typeSet.has('borrow')) {
      pipelines.push({
        collection: 'borrows',
        match: buildPersonMatch(),
        project: {
          _type: { $literal: 'borrow' },
          _label: '$personName',
          personName: 1, reason: 1, amount: 1, date: 1, userId: 1,
        },
      });
    }
    if (typeSet.has('lend')) {
      pipelines.push({
        collection: 'lends',
        match: buildPersonMatch(),
        project: {
          _type: { $literal: 'lend' },
          _label: '$personName',
          personName: 1, reason: 1, amount: 1, date: 1, userId: 1,
        },
      });
    }

    if (pipelines.length === 0) {
      return res.json({ results: [], pagination: { page: 1, limit: limitNum, total: 0, totalPages: 0 } });
    }

    // Build aggregation pipeline starting from first collection
    const firstPipeline = pipelines[0];
    const Model = mongoose.connection.collection(firstPipeline.collection);

    const aggPipeline = [
      { $match: firstPipeline.match },
      { $project: firstPipeline.project },
    ];

    // $unionWith remaining collections
    for (let i = 1; i < pipelines.length; i++) {
      aggPipeline.push({
        $unionWith: {
          coll: pipelines[i].collection,
          pipeline: [
            { $match: pipelines[i].match },
            { $project: pipelines[i].project },
          ],
        },
      });
    }

    // Use $facet for count + paginated data in single DB round-trip
    aggPipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: sortOrder },
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum },
        ],
      },
    });

    const [result] = await Model.aggregate(aggPipeline, { maxTimeMS: 5000 }).toArray();

    const total = result.metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      results: result.data,
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
