import api from './api';

export const getIncome = (month, year) =>
  api.get('/income', { params: { month, year } });

export const createIncome = (data) => api.post('/income', data);

export const updateIncome = (id, data) => api.put(`/income/${id}`, data);
