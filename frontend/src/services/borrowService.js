import api from './api';

export const getBorrows = (month, year) =>
  api.get('/borrows', { params: { month, year } });

export const createBorrow = (data) => api.post('/borrows', data);

export const updateBorrow = (id, data) => api.put(`/borrows/${id}`, data);

export const deleteBorrow = (id) => api.delete(`/borrows/${id}`);
