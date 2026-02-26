import api from './api';

/**
 * Fetch all dashboard data in a single batched API call.
 * Returns { summary, income, expenses, borrows, lends }.
 * Reduces 5 waterfall requests → 1 round-trip.
 */
export const getDashboardData = (month, year) =>
  api.get('/dashboard', { params: { month, year } });
