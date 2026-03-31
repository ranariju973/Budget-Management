const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireGroupMember, requireGroupAdmin } = require('../middleware/groupAuth');
const {
  getMyGroups,
  createGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  generateInvite,
  joinGroup,
  leaveGroup,
  removeMember,
  settleGroup,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/splitGroupController');

// All routes require authentication
router.use(protect);

// ─── Group-level routes ───────────────────────────────────────────────
router.get('/', getMyGroups);
router.post('/', createGroup);

// Join via invite token (no group membership required — that's the point)
router.post('/join/:token', joinGroup);

// ─── Routes that require group membership ─────────────────────────────
router.get('/:groupId', requireGroupMember, getGroupDetails);
router.put('/:groupId', requireGroupMember, requireGroupAdmin, updateGroup);
router.delete('/:groupId', requireGroupMember, requireGroupAdmin, deleteGroup);

// Invite management
router.post('/:groupId/invite', requireGroupMember, requireGroupAdmin, generateInvite);

// Member management
router.post('/:groupId/leave', requireGroupMember, leaveGroup);
router.delete('/:groupId/remove/:userId', requireGroupMember, requireGroupAdmin, removeMember);

// Settlement
router.patch('/:groupId/settle', requireGroupMember, requireGroupAdmin, settleGroup);

// ─── Expense routes (within a group) ──────────────────────────────────
router.get('/:groupId/expenses', requireGroupMember, getExpenses);
router.post('/:groupId/expenses', requireGroupMember, addExpense);
router.put('/:groupId/expenses/:expenseId', requireGroupMember, updateExpense);
router.delete('/:groupId/expenses/:expenseId', requireGroupMember, deleteExpense);

module.exports = router;
