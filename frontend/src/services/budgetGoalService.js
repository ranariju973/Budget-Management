import api from './api';

export const getChartData = (month, year) =>
  api.get('/budget-goals/chart-data', { params: { month, year } });
