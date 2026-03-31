import api from './api';

// ─── Group endpoints ──────────────────────────────────────────────────
export const getMyGroups = () => api.get('/split-groups');

export const createGroup = (name) => api.post('/split-groups', { name });

export const getGroupDetails = (groupId) => api.get(`/split-groups/${groupId}`);

export const updateGroup = (groupId, name) =>
  api.put(`/split-groups/${groupId}`, { name });

export const deleteGroup = (groupId) => api.delete(`/split-groups/${groupId}`);

// ─── Invite & membership ─────────────────────────────────────────────
export const generateInvite = (groupId) =>
  api.post(`/split-groups/${groupId}/invite`);

export const joinGroup = (token) =>
  api.post(`/split-groups/join/${token}`);

export const leaveGroup = (groupId) =>
  api.post(`/split-groups/${groupId}/leave`);

export const removeMember = (groupId, userId) =>
  api.delete(`/split-groups/${groupId}/remove/${userId}`);

export const settleGroup = (groupId) =>
  api.patch(`/split-groups/${groupId}/settle`);

// ─── Expense endpoints ───────────────────────────────────────────────
export const getGroupExpenses = (groupId) =>
  api.get(`/split-groups/${groupId}/expenses`);

export const addGroupExpense = (groupId, data) =>
  api.post(`/split-groups/${groupId}/expenses`, data);

export const updateGroupExpense = (groupId, expenseId, data) =>
  api.put(`/split-groups/${groupId}/expenses/${expenseId}`, data);

export const deleteGroupExpense = (groupId, expenseId) =>
  api.delete(`/split-groups/${groupId}/expenses/${expenseId}`);
