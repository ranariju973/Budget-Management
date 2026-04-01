const mongoose = require('mongoose');
const SplitGroup = require('../models/SplitGroup');
const SplitExpense = require('../models/SplitExpense');
const User = require('../models/User');
const { handleError } = require('../utils/errorHandler');

/**
 * Settlement Algorithm — calculates who owes whom
 * Uses a greedy min-transactions approach:
 * 1. Calculate each member's balance (paid - fairShare)
 * 2. Separate into payers (balance < 0) and receivers (balance > 0)
 * 3. Greedily match the largest payer with the largest receiver
 * Time: O(n log n) for sorting + O(n) for matching
 */
const calculateSettlement = (members, expenses) => {
  if (expenses.length === 0 || members.length === 0) {
    return { totalExpense: 0, fairShare: 0, balances: [], transfers: [], advancedBreakdown: null };
  }

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fairShare = totalExpense / members.length;
  const memberCount = members.length;
  const r = (n) => Math.round(n * 100) / 100;

  // Build a map of how much each member paid
  const paidMap = {};
  for (const m of members) {
    paidMap[m.userId.toString()] = 0;
  }
  for (const e of expenses) {
    const key = e.paidBy.toString();
    if (paidMap[key] !== undefined) {
      paidMap[key] += e.amount;
    }
  }

  // Calculate balances
  const memberMap = {};
  for (const m of members) {
    memberMap[m.userId.toString()] = m;
  }

  const balances = members.map((m) => {
    const id = m.userId.toString();
    const paid = paidMap[id] || 0;
    const balance = paid - fairShare;
    return {
      userId: id,
      name: m.name,
      paid: r(paid),
      fairShare: r(fairShare),
      balance: r(balance),
    };
  });

  // Separate into payers (owe money) and receivers (should get money)
  const payers = [];   // negative balance → need to pay
  const receivers = []; // positive balance → should receive

  for (const b of balances) {
    if (b.balance < -0.01) {
      payers.push({ ...b, remaining: Math.abs(b.balance) });
    } else if (b.balance > 0.01) {
      receivers.push({ ...b, remaining: b.balance });
    }
  }

  // Sort descending by remaining amount
  payers.sort((a, b) => b.remaining - a.remaining);
  receivers.sort((a, b) => b.remaining - a.remaining);

  // Greedy matching — minimizes number of transactions
  const transfers = [];
  let pi = 0;
  let ri = 0;

  while (pi < payers.length && ri < receivers.length) {
    const amount = Math.min(payers[pi].remaining, receivers[ri].remaining);

    if (amount > 0.01) {
      transfers.push({
        from: { userId: payers[pi].userId, name: payers[pi].name },
        to: { userId: receivers[ri].userId, name: receivers[ri].name },
        amount: r(amount),
      });
    }

    payers[pi].remaining -= amount;
    receivers[ri].remaining -= amount;

    if (payers[pi].remaining < 0.01) pi++;
    if (receivers[ri].remaining < 0.01) ri++;
  }

  // ── Advanced Breakdown ──────────────────────────────────────────────
  // Step 1: Per-expense equal share split
  const perExpenseSplits = expenses.map((e) => {
    const payerMember = memberMap[e.paidBy.toString()];
    return {
      title: e.title,
      amount: r(e.amount),
      paidByUserId: e.paidBy.toString(),
      paidByName: payerMember?.name || 'Unknown',
      perPersonShare: r(e.amount / memberCount),
    };
  });

  // Step 2: Individual payment breakdown
  // For each person, calculate what they owe to each other person who paid more per-expense
  const individualBreakdown = members.map((m) => {
    const myId = m.userId.toString();
    const myPaidTotal = paidMap[myId] || 0;
    const mySharePerExpense = r(myPaidTotal / memberCount); // what each person owes me

    // Calculate what I owe each other person
    const owes = [];
    for (const other of members) {
      const otherId = other.userId.toString();
      if (otherId === myId) continue;

      const otherPaidTotal = paidMap[otherId] || 0;
      if (otherPaidTotal <= 0) continue;

      const iOweThemPerExpense = r(otherPaidTotal / memberCount); // my share of their expense
      const theyOweMePerExpense = mySharePerExpense; // their share of my expense
      const netOwe = r(iOweThemPerExpense - theyOweMePerExpense);

      if (netOwe > 0.01) {
        owes.push({
          toUserId: otherId,
          toName: other.name,
          iOweThemShare: iOweThemPerExpense,
          theyOweMeShare: theyOweMePerExpense,
          netAmount: netOwe,
        });
      }
    }

    return {
      userId: myId,
      name: m.name,
      totalPaid: r(myPaidTotal),
      owes,
    };
  });

  return {
    totalExpense: r(totalExpense),
    fairShare: r(fairShare),
    balances,
    transfers,
    advancedBreakdown: {
      memberCount,
      perExpenseSplits,
      individualBreakdown,
    },
  };
};

// ─── GET /api/split-groups ────────────────────────────────────────────
const getMyGroups = async (req, res) => {
  try {
    const groups = await SplitGroup.find({
      'members.userId': req.user._id,
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Attach expense count and total for each group
    const groupIds = groups.map((g) => g._id);
    const expenseAgg = await SplitExpense.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      {
        $group: {
          _id: '$groupId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const expenseMap = {};
    for (const e of expenseAgg) {
      expenseMap[e._id.toString()] = { total: e.total, count: e.count };
    }

    const result = groups.map((g) => ({
      ...g,
      expenseTotal: expenseMap[g._id.toString()]?.total || 0,
      expenseCount: expenseMap[g._id.toString()]?.count || 0,
    }));

    res.json(result);
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups ───────────────────────────────────────────
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = new SplitGroup({
      name: name.trim(),
      createdBy: req.user._id,
      members: [
        {
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: 'admin',
          joinedAt: new Date(),
        },
      ],
    });

    // Auto-generate invite token on creation
    group.generateInviteToken();

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── GET /api/split-groups/:groupId ───────────────────────────────────
const getGroupDetails = async (req, res) => {
  try {
    const group = req.group; // attached by requireGroupMember middleware

    const expenses = await SplitExpense.find({ groupId: group._id })
      .sort({ date: -1 })
      .lean();

    const settlement = calculateSettlement(group.members, expenses);

    res.json({
      group: group.toJSON(),
      expenses,
      settlement,
    });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── PUT /api/split-groups/:groupId ───────────────────────────────────
const updateGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    req.group.name = name.trim();
    await req.group.save();

    res.json(req.group);
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── DELETE /api/split-groups/:groupId ────────────────────────────────
const deleteGroup = async (req, res) => {
  try {
    // Delete all expenses in the group first
    await SplitExpense.deleteMany({ groupId: req.group._id });
    await SplitGroup.findByIdAndDelete(req.group._id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups/:groupId/invite ───────────────────────────
const generateInvite = async (req, res) => {
  try {
    const token = req.group.generateInviteToken();
    await req.group.save();

    const baseUrl = process.env.FRONTEND_URL || 'https://finkert.vercel.app';
    const inviteLink = `${baseUrl}/join/${token}`;

    res.json({ inviteToken: token, inviteLink, expiresAt: req.group.inviteTokenExpiresAt });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups/join/:token ───────────────────────────────
const joinGroup = async (req, res) => {
  try {
    const { token } = req.params;

    const group = await SplitGroup.findOne({
      inviteToken: token,
      inviteTokenExpiresAt: { $gt: new Date() },
    });

    if (!group) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    // Check if already a member
    if (group.isMember(req.user._id)) {
      return res.json({ message: 'You are already a member of this group', group });
    }

    // Check member limit
    if (group.members.length >= 20) {
      return res.status(400).json({ message: 'This group has reached the maximum of 20 members' });
    }

    // Check if group is settled
    if (group.isSettled) {
      return res.status(400).json({ message: 'This group has been settled. No new members allowed.' });
    }

    // Add user to group
    group.members.push({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: 'member',
      joinedAt: new Date(),
    });

    await group.save();

    res.json({ message: `Joined "${group.name}" successfully`, group });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups/:groupId/leave ────────────────────────────
const leaveGroup = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Admin cannot leave if they're the only admin
    if (req.memberRole === 'admin') {
      const adminCount = req.group.members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'You are the only admin. Transfer admin role or delete the group.',
        });
      }
    }

    req.group.members = req.group.members.filter(
      (m) => m.userId.toString() !== userId
    );

    await req.group.save();
    res.json({ message: 'You have left the group' });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── DELETE /api/split-groups/:groupId/remove/:userId ─────────────────
const removeMember = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Cannot remove yourself — use leave instead
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Use the leave endpoint to leave the group' });
    }

    // Cannot remove another admin
    const target = req.group.members.find(
      (m) => m.userId.toString() === targetUserId
    );

    if (!target) {
      return res.status(404).json({ message: 'User is not a member of this group' });
    }

    if (target.role === 'admin') {
      return res.status(400).json({ message: 'Cannot remove another admin' });
    }

    req.group.members = req.group.members.filter(
      (m) => m.userId.toString() !== targetUserId
    );

    await req.group.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── PATCH /api/split-groups/:groupId/settle ──────────────────────────
const settleGroup = async (req, res) => {
  try {
    if (req.group.isSettled) {
      return res.status(400).json({ message: 'Group is already settled' });
    }

    req.group.isSettled = true;
    req.group.settledAt = new Date();
    await req.group.save();

    res.json({ message: 'Group settled successfully', group: req.group });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── GET /api/split-groups/:groupId/expenses ──────────────────────────
const getExpenses = async (req, res) => {
  try {
    const expenses = await SplitExpense.find({ groupId: req.group._id })
      .sort({ date: -1 })
      .lean();

    res.json(expenses);
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

// ─── POST /api/split-groups/:groupId/expenses ─────────────────────────
const addExpense = async (req, res) => {
  try {
    if (req.group.isSettled) {
      return res.status(400).json({ message: 'Cannot add expenses to a settled group' });
    }

    const { title, amount, paidBy, date } = req.body;

    if (!title || !amount || !paidBy || !date) {
      return res.status(400).json({
        message: 'Title, amount, paid by, and date are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(paidBy)) {
      return res.status(400).json({ message: 'Invalid paidBy user ID' });
    }

    // Verify paidBy is a group member
    if (!req.group.isMember(paidBy)) {
      return res.status(400).json({ message: 'The person who paid must be a group member' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const expense = await SplitExpense.create({
      groupId: req.group._id,
      title: title.trim(),
      amount: parsedAmount,
      paidBy,
      date: new Date(date),
      addedBy: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

// ─── PUT /api/split-groups/:groupId/expenses/:expenseId ───────────────
const updateExpense = async (req, res) => {
  try {
    if (req.group.isSettled) {
      return res.status(400).json({ message: 'Cannot edit expenses in a settled group' });
    }

    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    const expense = await SplitExpense.findOne({
      _id: expenseId,
      groupId: req.group._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only the person who added or group admin can edit
    if (
      expense.addedBy.toString() !== req.user._id.toString() &&
      req.memberRole !== 'admin'
    ) {
      return res.status(403).json({ message: 'Only the person who added this expense or the admin can edit it' });
    }

    const { title, amount, paidBy, date } = req.body;

    if (title) expense.title = title.trim();
    if (amount) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      expense.amount = parsedAmount;
    }
    if (paidBy) {
      if (!mongoose.Types.ObjectId.isValid(paidBy)) {
        return res.status(400).json({ message: 'Invalid paidBy user ID' });
      }
      if (!req.group.isMember(paidBy)) {
        return res.status(400).json({ message: 'The person who paid must be a group member' });
      }
      expense.paidBy = paidBy;
    }
    if (date) expense.date = new Date(date);

    await expense.save();
    res.json(expense);
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

// ─── DELETE /api/split-groups/:groupId/expenses/:expenseId ────────────
const deleteExpense = async (req, res) => {
  try {
    if (req.group.isSettled) {
      return res.status(400).json({ message: 'Cannot delete expenses in a settled group' });
    }

    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: 'Invalid expense ID' });
    }

    const expense = await SplitExpense.findOne({
      _id: expenseId,
      groupId: req.group._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only the person who added or group admin can delete
    if (
      expense.addedBy.toString() !== req.user._id.toString() &&
      req.memberRole !== 'admin'
    ) {
      return res.status(403).json({ message: 'Only the person who added this expense or the admin can delete it' });
    }

    await SplitExpense.findByIdAndDelete(expenseId);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

module.exports = {
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
};
