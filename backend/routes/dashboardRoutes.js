const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardData } = require('../controllers/dashboardController');

router.use(protect);

// GET /api/dashboard?month=1&year=2026 — single batched endpoint
router.get('/', getDashboardData);

module.exports = router;
