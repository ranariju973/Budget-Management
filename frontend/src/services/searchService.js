import api from './api';

/**
 * Unified search across expenses, borrows, lends.
 * @param {Object} params - Search parameters
 * @param {string} [params.q] - Text query
 * @param {string} [params.date] - Exact date (YYYY-MM-DD)
 * @param {number} [params.month] - Month (1-12)
 * @param {number} [params.year] - Year
 * @param {string} [params.from] - Date range start
 * @param {string} [params.to] - Date range end
 * @param {string} [params.type] - Filter: expense,borrow,lend
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Results per page
 * @param {string} [params.sort] - date_desc|date_asc|amount_desc|amount_asc
 */
export const searchAll = (params) =>
  api.get('/search', { params });

/**
 * Get autocomplete suggestions for a prefix.
 * @param {string} q - Prefix text
 * @param {number} [limit=8] - Max suggestions
 */
export const getSuggestions = (q, limit = 8) =>
  api.get('/search/suggestions', { params: { q, limit } });

/**
 * Get recent terms for initial search suggestions.
 */
export const getRecentTerms = () =>
  api.get('/search/recent');
