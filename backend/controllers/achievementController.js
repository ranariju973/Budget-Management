const Achievement = require('../models/Achievement');
const { evaluateAchievements, BADGES } = require('../services/achievementEvaluator');
const { handleError } = require('../utils/errorHandler');

/**
 * @desc    Get all achievements — returns badge catalog + user's unlocked badges
 * @route   GET /api/achievements
 * @access  Private
 */
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's unlocked achievements
    const unlocked = await Achievement.find({ userId }).lean();
    const unlockedMap = {};
    unlocked.forEach((a) => {
      unlockedMap[a.badgeId] = a.unlockedAt;
    });

    // Build full catalog with unlock status
    const catalog = BADGES.map((badge) => ({
      id: badge.id,
      name: badge.name,
      emoji: badge.emoji,
      description: badge.description,
      category: badge.category,
      unlocked: !!unlockedMap[badge.id],
      unlockedAt: unlockedMap[badge.id] || null,
    }));

    res.json({
      total: BADGES.length,
      unlocked: unlocked.length,
      badges: catalog,
    });
  } catch (error) {
    handleError(res, error, 'Achievements');
  }
};

/**
 * @desc    Manually trigger achievement evaluation for the logged-in user
 * @route   POST /api/achievements/check
 * @access  Private
 */
const evaluateNow = async (req, res) => {
  try {
    const userId = req.user._id;
    const newlyUnlocked = await evaluateAchievements(userId);

    // Fetch updated state
    const unlocked = await Achievement.find({ userId }).lean();
    const unlockedMap = {};
    unlocked.forEach((a) => {
      unlockedMap[a.badgeId] = a.unlockedAt;
    });

    const catalog = BADGES.map((badge) => ({
      id: badge.id,
      name: badge.name,
      emoji: badge.emoji,
      description: badge.description,
      category: badge.category,
      unlocked: !!unlockedMap[badge.id],
      unlockedAt: unlockedMap[badge.id] || null,
    }));

    res.json({
      total: BADGES.length,
      unlocked: unlocked.length,
      newlyUnlocked,
      badges: catalog,
    });
  } catch (error) {
    handleError(res, error, 'Achievement Evaluation');
  }
};

module.exports = { getUserAchievements, evaluateNow };
