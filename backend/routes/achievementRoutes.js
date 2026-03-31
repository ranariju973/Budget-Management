const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserAchievements, evaluateNow } = require('../controllers/achievementController');

router.use(protect);

// GET /api/achievements — full badge catalog + user's unlocked badges
router.get('/', getUserAchievements);

// POST /api/achievements/check — manually trigger evaluation
router.post('/check', evaluateNow);

module.exports = router;
