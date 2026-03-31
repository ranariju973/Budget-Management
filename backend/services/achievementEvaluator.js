const Achievement = require('../models/Achievement');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Borrow = require('../models/Borrow');
const Lend = require('../models/Lend');
const BudgetGoal = require('../models/BudgetGoal');

/**
 * ─── Badge Definitions ────────────────────────────────────────────────
 * Each badge has an id, name, emoji, description, category,
 * and an async `check(userId)` function that returns true if earned.
 */
const BADGES = [
  // ── Getting Started ──
  {
    id: 'first_income',
    name: 'First Income',
    emoji: '💰',
    description: 'Set your income for the first time',
    category: 'Getting Started',
    check: async (userId) => {
      const count = await Income.countDocuments({ userId });
      return count >= 1;
    },
  },
  {
    id: 'first_expense',
    name: 'First Expense',
    emoji: '📝',
    description: 'Log your first expense',
    category: 'Getting Started',
    check: async (userId) => {
      const count = await Expense.countDocuments({ userId });
      return count >= 1;
    },
  },

  // ── Consistency ──
  {
    id: 'streak_7',
    name: '7-Day Streak',
    emoji: '🔥',
    description: 'Log expenses for 7 consecutive days',
    category: 'Consistency',
    check: async (userId) => {
      return await checkConsecutiveDays(userId, 7);
    },
  },
  {
    id: 'streak_30',
    name: '30-Day Streak',
    emoji: '🏆',
    description: 'Log expenses for 30 consecutive days',
    category: 'Consistency',
    check: async (userId) => {
      return await checkConsecutiveDays(userId, 30);
    },
  },

  // ── Savings ──
  {
    id: 'saver_20',
    name: 'Saver 20%',
    emoji: '🐷',
    description: 'Saved 20%+ of income in a month',
    category: 'Savings',
    check: async (userId) => {
      return await checkSavingsPercent(userId, 20);
    },
  },
  {
    id: 'saver_50',
    name: 'Saver 50%',
    emoji: '💎',
    description: 'Saved 50%+ of income in a month',
    category: 'Savings',
    check: async (userId) => {
      return await checkSavingsPercent(userId, 50);
    },
  },

  // ── Borrowing ──
  {
    id: 'debt_free',
    name: 'Debt Free',
    emoji: '🏦',
    description: 'Paid back all borrowed money',
    category: 'Borrowing',
    check: async (userId) => {
      const totalBorrows = await Borrow.countDocuments({ userId });
      if (totalBorrows === 0) return false; // Must have borrowed at least once
      const unpaid = await Borrow.countDocuments({ userId, isPaid: false });
      return unpaid === 0;
    },
  },

  // ── Lending ──
  {
    id: 'generous_lender',
    name: 'Generous Lender',
    emoji: '💸',
    description: 'Lent money to 3+ different people',
    category: 'Lending',
    check: async (userId) => {
      const uniquePeople = await Lend.distinct('personName', { userId });
      return uniquePeople.length >= 3;
    },
  },

  // ── Planning ──
  {
    id: 'budget_master',
    name: 'Budget Master',
    emoji: '🎯',
    description: 'Set 3+ budget goals in a single month',
    category: 'Planning',
    check: async (userId) => {
      // Check all months — if any month has 3+ goals, badge earned
      const result = await BudgetGoal.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: { month: '$month', year: '$year' }, count: { $sum: 1 } } },
        { $match: { count: { $gte: 3 } } },
        { $limit: 1 },
      ]);
      return result.length > 0;
    },
  },

  // ── Milestones ──
  {
    id: 'expense_tracker_pro',
    name: 'Expense Tracker Pro',
    emoji: '📊',
    description: 'Logged 50+ expenses total',
    category: 'Milestones',
    check: async (userId) => {
      const count = await Expense.countDocuments({ userId });
      return count >= 50;
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    emoji: '🧘',
    description: 'Spent less than ₹500 in a day for 7+ days',
    category: 'Spending',
    check: async (userId) => {
      // Aggregate: group expenses by date, find days with total < 500
      const result = await Expense.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' },
            },
            dailyTotal: { $sum: '$amount' },
          },
        },
        { $match: { dailyTotal: { $lt: 500 } } },
      ]);
      return result.length >= 7;
    },
  },

  // ── Ultimate ──
  {
    id: 'finkart_legend',
    name: 'FinKart Legend',
    emoji: '👑',
    description: 'Unlock 10 or more other badges',
    category: 'Ultimate',
    check: async (userId) => {
      const count = await Achievement.countDocuments({
        userId,
        badgeId: { $ne: 'finkart_legend' },
      });
      return count >= 10;
    },
  },
];

// ─── Helper: Check consecutive days of expense logging ─────────────
async function checkConsecutiveDays(userId, requiredDays) {
  // Get all unique dates the user logged expenses, sorted ascending
  const result = await Expense.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  if (result.length < requiredDays) return false;

  // Walk through dates, count consecutive runs
  let streak = 1;
  for (let i = 1; i < result.length; i++) {
    const prev = new Date(result[i - 1]._id);
    const curr = new Date(result[i]._id);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
      if (streak >= requiredDays) return true;
    } else {
      streak = 1;
    }
  }
  return streak >= requiredDays;
}

// ─── Helper: Check if user saved X% of income in any month ────────
async function checkSavingsPercent(userId, percent) {
  const incomes = await Income.find({ userId }).lean();

  for (const inc of incomes) {
    if (!inc.amount || inc.amount === 0) continue;

    const startDate = new Date(inc.year, inc.month - 1, 1);
    const endDate = new Date(inc.year, inc.month, 0, 23, 59, 59);

    const expenseAgg = await Expense.aggregate([
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpenses = expenseAgg[0]?.total || 0;
    const savedPercent = ((inc.amount - totalExpenses) / inc.amount) * 100;

    if (savedPercent >= percent) return true;
  }
  return false;
}

/**
 * ─── Main Evaluator ──────────────────────────────────────────────────
 * Evaluate all badges for a user and unlock any new ones.
 * Returns array of newly unlocked badge IDs.
 */
const evaluateAchievements = async (userId) => {
  // Get already unlocked badges
  const existing = await Achievement.find({ userId }).lean();
  const unlockedSet = new Set(existing.map((a) => a.badgeId));

  const newlyUnlocked = [];

  for (const badge of BADGES) {
    // Skip if already unlocked
    if (unlockedSet.has(badge.id)) continue;

    try {
      const earned = await badge.check(userId);
      if (earned) {
        await Achievement.create({ userId, badgeId: badge.id });
        newlyUnlocked.push(badge.id);
      }
    } catch (err) {
      console.error(`[Achievements] Error evaluating "${badge.id}" for user ${userId}:`, err.message);
    }
  }

  return newlyUnlocked;
};

module.exports = { evaluateAchievements, BADGES };
