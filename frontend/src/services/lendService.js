import api from './api';

export const getLends = (month, year) =>
  api.get('/lends', { params: { month, year } });

export const createLend = (data) => api.post('/lends', data);

export const updateLend = (id, data) => api.put(`/lends/${id}`, data);

export const deleteLend = (id) => api.delete(`/lends/${id}`);
