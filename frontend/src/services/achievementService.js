import api from './api';

/**
 * Fetch the full badge catalog with user's unlock status.
 * Returns { total, unlocked, badges[] }
 */
export const getAchievements = () => api.get('/achievements');

/**
 * Manually trigger achievement evaluation for the logged-in user.
 * Returns { total, unlocked, newlyUnlocked[], badges[] }
 */
export const checkAchievements = () => api.post('/achievements/check');
