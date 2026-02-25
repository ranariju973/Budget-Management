import api from './api';

export const getExpenses = (month, year) =>
  api.get('/expenses', { params: { month, year } });

export const createExpense = (data) => api.post('/expenses', data);

export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
