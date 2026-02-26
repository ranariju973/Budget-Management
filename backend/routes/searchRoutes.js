const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { search, getSuggestions, getRecentTerms } = require('../controllers/searchController');

// All search routes require authentication
router.use(protect);

// GET /api/search — unified search across all collections
router.get('/', search);

// GET /api/search/suggestions?q=prefix — autocomplete suggestions
router.get('/suggestions', getSuggestions);

// GET /api/search/recent — recent terms for initial empty-state
router.get('/recent', getRecentTerms);

module.exports = router;
