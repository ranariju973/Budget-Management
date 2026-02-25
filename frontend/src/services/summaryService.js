import api from './api';

export const getSummary = (month, year) =>
  api.get('/summary', { params: { month, year } });
