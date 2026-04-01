const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { handleError } = require('../utils/errorHandler');
const { mapToApi } = require('../utils/supabaseCrudFactory');

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

  const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const fairShare = totalExpense / members.length;
  const memberCount = members.length;
  const r = (n) => Math.round(n * 100) / 100;

  // Build a map of how much each member paid
  const paidMap = {};
  for (const m of members) {
    paidMap[m.user_id] = 0;
  }
  for (const e of expenses) {
    const key = e.paid_by;
    if (paidMap[key] !== undefined) {
      paidMap[key] += parseFloat(e.amount);
    }
  }

  // Calculate balances
  const memberMap = {};
  for (const m of members) {
    memberMap[m.user_id] = m;
  }

  const balances = members.map((m) => {
    const id = m.user_id;
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
    const payerMember = memberMap[e.paid_by];
    return {
      title: e.title,
      amount: r(parseFloat(e.amount)),
      paidByUserId: e.paid_by,
      paidByName: payerMember?.name || 'Unknown',
      perPersonShare: r(parseFloat(e.amount) / memberCount),
    };
  });

  // Step 2: Individual payment breakdown
  const individualBreakdown = members.map((m) => {
    const myId = m.user_id;
    const myPaidTotal = paidMap[myId] || 0;
    const mySharePerExpense = r(myPaidTotal / memberCount);

    const owes = [];
    for (const other of members) {
      const otherId = other.user_id;
      if (otherId === myId) continue;

      const otherPaidTotal = paidMap[otherId] || 0;
      if (otherPaidTotal <= 0) continue;

      const iOweThemPerExpense = r(otherPaidTotal / memberCount);
      const theyOweMePerExpense = mySharePerExpense;
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

// Helper to map group data to API format
const mapGroupToApi = (group, members) => ({
  _id: group.id,
  id: group.id,
  name: group.name,
  createdBy: group.created_by,
  isSettled: group.is_settled,
  settledAt: group.settled_at,
  inviteToken: group.invite_token,
  inviteTokenExpiresAt: group.invite_token_expires_at,
  createdAt: group.created_at,
  updatedAt: group.updated_at,
  members: members.map((m) => ({
    userId: m.user_id,
    name: m.name,
    email: m.email,
    role: m.role,
    joinedAt: m.joined_at,
  })),
});

// ─── GET /api/split-groups ────────────────────────────────────────────
const getMyGroups = async (req, res) => {
  try {
    // Get groups where user is a member
    const { data: memberOf, error: memberError } = await supabaseAdmin
      .from('split_group_members')
      .select('group_id')
      .eq('user_id', req.user.id);

    if (memberError) throw memberError;

    if (!memberOf || memberOf.length === 0) {
      return res.json([]);
    }

    const groupIds = memberOf.map((m) => m.group_id);

    // Get groups and their members
    const [groupsResult, membersResult, expensesResult] = await Promise.all([
      supabaseAdmin.from('split_groups').select('*').in('id', groupIds).order('updated_at', { ascending: false }),
      supabaseAdmin.from('split_group_members').select('*').in('group_id', groupIds),
      supabaseAdmin.from('split_expenses').select('group_id, amount').in('group_id', groupIds),
    ]);

    // Build members map
    const membersMap = {};
    (membersResult.data || []).forEach((m) => {
      if (!membersMap[m.group_id]) membersMap[m.group_id] = [];
      membersMap[m.group_id].push(m);
    });

    // Build expense totals
    const expenseMap = {};
    (expensesResult.data || []).forEach((e) => {
      if (!expenseMap[e.group_id]) expenseMap[e.group_id] = { total: 0, count: 0 };
      expenseMap[e.group_id].total += parseFloat(e.amount);
      expenseMap[e.group_id].count++;
    });

    const result = (groupsResult.data || []).map((g) => ({
      ...mapGroupToApi(g, membersMap[g.id] || []),
      expenseTotal: expenseMap[g.id]?.total || 0,
      expenseCount: expenseMap[g.id]?.count || 0,
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

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('split_groups')
      .insert({
        name: name.trim(),
        created_by: req.user.id,
        invite_token: inviteToken,
        invite_token_expires_at: inviteTokenExpiresAt.toISOString(),
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as admin member
    const { data: member, error: memberError } = await supabaseAdmin
      .from('split_group_members')
      .insert({
        group_id: group.id,
        user_id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: 'admin',
      })
      .select()
      .single();

    if (memberError) throw memberError;

    res.status(201).json(mapGroupToApi(group, [member]));
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── GET /api/split-groups/:groupId ───────────────────────────────────
const getGroupDetails = async (req, res) => {
  try {
    const group = req.group;
    const members = req.groupMembers;

    const { data: expenses, error: expError } = await supabaseAdmin
      .from('split_expenses')
      .select('*')
      .eq('group_id', group.id)
      .order('date', { ascending: false });

    if (expError) throw expError;

    const settlement = calculateSettlement(members, expenses || []);

    res.json({
      group: mapGroupToApi(group, members),
      expenses: (expenses || []).map((e) => mapToApi(e, { paidBy: 'paid_by', addedBy: 'added_by', groupId: 'group_id' })),
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

    const { data, error } = await supabaseAdmin
      .from('split_groups')
      .update({ name: name.trim() })
      .eq('id', req.group.id)
      .select()
      .single();

    if (error) throw error;

    res.json(mapGroupToApi(data, req.groupMembers));
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── DELETE /api/split-groups/:groupId ────────────────────────────────
const deleteGroup = async (req, res) => {
  try {
    // Delete all expenses in the group first
    await supabaseAdmin.from('split_expenses').delete().eq('group_id', req.group.id);
    // Delete all members
    await supabaseAdmin.from('split_group_members').delete().eq('group_id', req.group.id);
    // Delete the group
    await supabaseAdmin.from('split_groups').delete().eq('id', req.group.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups/:groupId/invite ───────────────────────────
const generateInvite = async (req, res) => {
  try {
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabaseAdmin
      .from('split_groups')
      .update({
        invite_token: inviteToken,
        invite_token_expires_at: inviteTokenExpiresAt.toISOString(),
      })
      .eq('id', req.group.id)
      .select()
      .single();

    if (error) throw error;

    const baseUrl = process.env.FRONTEND_URL || 'https://finkert.vercel.app';
    const inviteLink = `${baseUrl}/join/${inviteToken}`;

    res.json({ inviteToken, inviteLink, expiresAt: inviteTokenExpiresAt });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups/join/:token ───────────────────────────────
const joinGroup = async (req, res) => {
  try {
    const { token } = req.params;

    const { data: group, error: groupError } = await supabaseAdmin
      .from('split_groups')
      .select('*')
      .eq('invite_token', token)
      .gt('invite_token_expires_at', new Date().toISOString())
      .single();

    if (groupError || !group) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    // Get members
    const { data: members } = await supabaseAdmin
      .from('split_group_members')
      .select('*')
      .eq('group_id', group.id);

    // Check if already a member
    const isMember = (members || []).some((m) => m.user_id === req.user.id);
    if (isMember) {
      return res.json({ message: 'You are already a member of this group', group: mapGroupToApi(group, members) });
    }

    // Check member limit
    if ((members || []).length >= 20) {
      return res.status(400).json({ message: 'This group has reached the maximum of 20 members' });
    }

    // Check if group is settled
    if (group.is_settled) {
      return res.status(400).json({ message: 'This group has been settled. No new members allowed.' });
    }

    // Add user to group
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('split_group_members')
      .insert({
        group_id: group.id,
        user_id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: 'member',
      })
      .select()
      .single();

    if (memberError) throw memberError;

    const updatedMembers = [...(members || []), newMember];
    res.json({ message: `Joined "${group.name}" successfully`, group: mapGroupToApi(group, updatedMembers) });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── POST /api/split-groups/:groupId/leave ────────────────────────────
const leaveGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    // Admin cannot leave if they're the only admin
    if (req.memberRole === 'admin') {
      const adminCount = req.groupMembers.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'You are the only admin. Transfer admin role or delete the group.',
        });
      }
    }

    await supabaseAdmin
      .from('split_group_members')
      .delete()
      .eq('group_id', req.group.id)
      .eq('user_id', userId);

    res.json({ message: 'You have left the group' });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── DELETE /api/split-groups/:groupId/remove/:userId ─────────────────
const removeMember = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    // Cannot remove yourself — use leave instead
    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'Use the leave endpoint to leave the group' });
    }

    // Find target member
    const target = req.groupMembers.find((m) => m.user_id === targetUserId);

    if (!target) {
      return res.status(404).json({ message: 'User is not a member of this group' });
    }

    if (target.role === 'admin') {
      return res.status(400).json({ message: 'Cannot remove another admin' });
    }

    await supabaseAdmin
      .from('split_group_members')
      .delete()
      .eq('group_id', req.group.id)
      .eq('user_id', targetUserId);

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── PATCH /api/split-groups/:groupId/settle ──────────────────────────
const settleGroup = async (req, res) => {
  try {
    if (req.group.is_settled) {
      return res.status(400).json({ message: 'Group is already settled' });
    }

    const { data, error } = await supabaseAdmin
      .from('split_groups')
      .update({ is_settled: true, settled_at: new Date().toISOString() })
      .eq('id', req.group.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Group settled successfully', group: mapGroupToApi(data, req.groupMembers) });
  } catch (error) {
    handleError(res, error, 'SplitGroup');
  }
};

// ─── GET /api/split-groups/:groupId/expenses ──────────────────────────
const getExpenses = async (req, res) => {
  try {
    const { data: expenses, error } = await supabaseAdmin
      .from('split_expenses')
      .select('*')
      .eq('group_id', req.group.id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json((expenses || []).map((e) => mapToApi(e, { paidBy: 'paid_by', addedBy: 'added_by', groupId: 'group_id' })));
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

// ─── POST /api/split-groups/:groupId/expenses ─────────────────────────
const addExpense = async (req, res) => {
  try {
    if (req.group.is_settled) {
      return res.status(400).json({ message: 'Cannot add expenses to a settled group' });
    }

    const { title, amount, paidBy, date } = req.body;

    if (!title || !amount || !paidBy || !date) {
      return res.status(400).json({
        message: 'Title, amount, paid by, and date are required',
      });
    }

    // Verify paidBy is a group member
    const isMember = req.groupMembers.some((m) => m.user_id === paidBy);
    if (!isMember) {
      return res.status(400).json({ message: 'The person who paid must be a group member' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const { data: expense, error } = await supabaseAdmin
      .from('split_expenses')
      .insert({
        group_id: req.group.id,
        title: title.trim(),
        amount: parsedAmount,
        paid_by: paidBy,
        date: new Date(date).toISOString().split('T')[0],
        added_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(mapToApi(expense, { paidBy: 'paid_by', addedBy: 'added_by', groupId: 'group_id' }));
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

// ─── PUT /api/split-groups/:groupId/expenses/:expenseId ───────────────
const updateExpense = async (req, res) => {
  try {
    if (req.group.is_settled) {
      return res.status(400).json({ message: 'Cannot edit expenses in a settled group' });
    }

    const { expenseId } = req.params;

    const { data: expense, error: fetchError } = await supabaseAdmin
      .from('split_expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('group_id', req.group.id)
      .single();

    if (fetchError || !expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only the person who added or group admin can edit
    if (expense.added_by !== req.user.id && req.memberRole !== 'admin') {
      return res.status(403).json({ message: 'Only the person who added this expense or the admin can edit it' });
    }

    const { title, amount, paidBy, date } = req.body;
    const updates = {};

    if (title) updates.title = title.trim();
    if (amount) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      updates.amount = parsedAmount;
    }
    if (paidBy) {
      const isMember = req.groupMembers.some((m) => m.user_id === paidBy);
      if (!isMember) {
        return res.status(400).json({ message: 'The person who paid must be a group member' });
      }
      updates.paid_by = paidBy;
    }
    if (date) updates.date = new Date(date).toISOString().split('T')[0];

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('split_expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(mapToApi(updated, { paidBy: 'paid_by', addedBy: 'added_by', groupId: 'group_id' }));
  } catch (error) {
    handleError(res, error, 'SplitExpense');
  }
};

// ─── DELETE /api/split-groups/:groupId/expenses/:expenseId ────────────
const deleteExpense = async (req, res) => {
  try {
    if (req.group.is_settled) {
      return res.status(400).json({ message: 'Cannot delete expenses in a settled group' });
    }

    const { expenseId } = req.params;

    const { data: expense, error: fetchError } = await supabaseAdmin
      .from('split_expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('group_id', req.group.id)
      .single();

    if (fetchError || !expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only the person who added or group admin can delete
    if (expense.added_by !== req.user.id && req.memberRole !== 'admin') {
      return res.status(403).json({ message: 'Only the person who added this expense or the admin can delete it' });
    }

    await supabaseAdmin.from('split_expenses').delete().eq('id', expenseId);
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
