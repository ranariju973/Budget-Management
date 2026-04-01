import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyGroups,
  createGroup,
  getGroupDetails,
  deleteGroup,
  generateInvite,
  leaveGroup,
  settleGroup,
  addGroupExpense,
  deleteGroupExpense,
} from '../../services/splitGroupService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiTrash2,
  FiCopy,
  FiChevronLeft,
  FiUsers,
  FiLogOut,
  FiCheck,
  FiArrowRight,
  FiRefreshCw,
  FiLock,
  FiChevronDown,
} from 'react-icons/fi';

const SplitGroupSection = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null); // groupId being viewed
  const [groupData, setGroupData] = useState(null); // full detail data
  const [detailLoading, setDetailLoading] = useState(false);

  // Create group
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  // Add expense
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    paidBy: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  // Invite
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Confirm modals
  const [deleteId, setDeleteId] = useState(null);
  const [leaveId, setLeaveId] = useState(null);
  const [settleId, setSettleId] = useState(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ─── Load groups ────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyGroups();
      setGroups(res.data);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ─── Load group detail ──────────────────────────────────────────────
  const fetchGroupDetail = useCallback(async (groupId) => {
    setDetailLoading(true);
    try {
      const res = await getGroupDetails(groupId);
      setGroupData(res.data);
    } catch {
      toast.error('Failed to load group details');
      setActiveGroup(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeGroup) fetchGroupDetail(activeGroup);
  }, [activeGroup, fetchGroupDetail]);

  // ─── Create group ───────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return toast.error('Enter a group name');
    setCreating(true);
    try {
      await createGroup(newGroupName.trim());
      toast.success('Group created!');
      setNewGroupName('');
      setShowCreate(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  // ─── Add expense ────────────────────────────────────────────────────
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.paidBy || !expenseForm.date) {
      return toast.error('All fields are required');
    }
    setSubmitting(true);
    try {
      await addGroupExpense(activeGroup, {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      });
      toast.success('Expense added!');
      setExpenseForm({
        title: '',
        amount: '',
        paidBy: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowExpenseForm(false);
      fetchGroupDetail(activeGroup);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete expense ─────────────────────────────────────────────────
  const handleDeleteExpense = async () => {
    try {
      await deleteGroupExpense(activeGroup, deleteExpenseId);
      toast.success('Expense deleted');
      setDeleteExpenseId(null);
      fetchGroupDetail(activeGroup);
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  // ─── Generate invite link ──────────────────────────────────────────
  const handleGenerateInvite = async () => {
    setInviteLoading(true);
    try {
      const res = await generateInvite(activeGroup);
      setInviteLink(res.data.inviteLink);
    } catch {
      toast.error('Failed to generate invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied!');
  };

  // ─── Delete group ───────────────────────────────────────────────────
  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(deleteId);
      toast.success('Group deleted');
      setDeleteId(null);
      setActiveGroup(null);
      setGroupData(null);
      fetchGroups();
    } catch {
      toast.error('Failed to delete group');
    }
  };

  // ─── Leave group ───────────────────────────────────────────────────
  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(leaveId);
      toast.success('Left the group');
      setLeaveId(null);
      setActiveGroup(null);
      setGroupData(null);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave group');
    }
  };

  // ─── Settle group ──────────────────────────────────────────────────
  const handleSettleGroup = async () => {
    try {
      await settleGroup(settleId);
      toast.success('Group settled!');
      setSettleId(null);
      fetchGroupDetail(activeGroup);
    } catch {
      toast.error('Failed to settle group');
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────
  const isAdmin = groupData?.group?.members?.find(
    (m) => m.userId === user?._id && m.role === 'admin'
  );
  const isSettled = groupData?.group?.isSettled;

  // ─── Go back to list ───────────────────────────────────────────────
  const goBack = () => {
    setActiveGroup(null);
    setGroupData(null);
    setInviteLink('');
    setShowExpenseForm(false);
    setShowAdvanced(false);
    fetchGroups();
  };

  // ════════════════════════════════════════════════════════════════════
  //  GROUP DETAIL VIEW
  // ════════════════════════════════════════════════════════════════════
  if (activeGroup && groupData) {
    const { group, expenses, settlement } = groupData;

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="split-card">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div className="flex items-center gap-3">
              <button onClick={goBack} className="p-1.5 rounded-full transition-colors tap-effect" style={{ color: 'var(--color-text-secondary)' }}>
                <FiChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
                    {group.name}
                  </h2>
                  {isSettled && (
                    <span className="split-badge split-badge-settled">
                      <FiLock size={10} /> Settled
                    </span>
                  )}
                </div>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  {group.members.length} member{group.members.length > 1 ? 's' : ''} · {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchGroupDetail(activeGroup)} className="p-1.5 rounded-full transition-colors tap-effect" style={{ color: 'var(--color-text-secondary)' }}>
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Members</span>
              <div className="flex gap-1">
                {isAdmin && !isSettled && (
                  <button
                    onClick={handleGenerateInvite}
                    disabled={inviteLoading}
                    className="split-btn-sm"
                  >
                    {inviteLoading ? '...' : '+ Invite'}
                  </button>
                )}
              </div>
            </div>

            {/* Invite link */}
            {inviteLink && (
              <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-[12px] bg-transparent outline-none truncate"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <button onClick={copyInviteLink} className="p-1.5 rounded-lg transition-colors tap-effect" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-hover)' }}>
                  <FiCopy size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => (
                <div key={m.userId} className="split-member-chip">
                  <div className="split-avatar" style={{ backgroundColor: m.role === 'admin' ? 'var(--color-accent)' : 'var(--color-text-muted)', color: 'var(--color-surface)' }}>
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: 'var(--color-text)' }}>
                    {m.userId === user?._id ? 'You' : m.name}
                  </span>
                  {m.role === 'admin' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions bar */}
          <div className="flex items-center gap-2 px-6 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            {!isSettled && (
              <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="split-btn-primary">
                <FiPlus size={14} /> Add Expense
              </button>
            )}
            {isAdmin && !isSettled && (
              <button onClick={() => setSettleId(activeGroup)} className="split-btn-settle">
                <FiCheck size={14} /> Settle
              </button>
            )}
            {isAdmin ? (
              <button onClick={() => setDeleteId(activeGroup)} className="split-btn-danger">
                <FiTrash2 size={14} />
              </button>
            ) : (
              <button onClick={() => setLeaveId(activeGroup)} className="split-btn-secondary">
                <FiLogOut size={14} /> Leave
              </button>
            )}
          </div>
        </div>

        {/* Add Expense Form */}
        {showExpenseForm && !isSettled && (
          <div className="split-card">
            <form onSubmit={handleAddExpense} className="px-6 py-4 space-y-3">
              <p className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>New Expense</p>
              <input
                type="text"
                placeholder="What was it for?"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                autoFocus
                className="w-full px-4 py-2.5 text-[15px] rounded-xl outline-none"
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="flex-1 px-4 py-2.5 text-[15px] rounded-xl outline-none"
                  style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}
                />
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="flex-1 px-4 py-2.5 text-[15px] rounded-xl outline-none"
                  style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}
                />
              </div>
              <select
                value={expenseForm.paidBy}
                onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                className="w-full px-4 py-2.5 text-[15px] rounded-xl outline-none"
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}
              >
                <option value="">Who paid?</option>
                {group.members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userId === user?._id ? 'You' : m.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-colors disabled:opacity-50 tap-effect"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
                >
                  {submitting ? '...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="px-5 py-2.5 text-[14px] font-semibold rounded-xl transition-colors tap-effect"
                  style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses List */}
        {expenses.length > 0 && (
          <div className="split-card">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Expenses ({expenses.length})
              </span>
            </div>
            <div className="px-6 py-2 overflow-y-auto" style={{ maxHeight: expenses.length > 6 ? '280px' : 'none' }}>
              <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {expenses.map((exp) => {
                  const payer = group.members.find((m) => m.userId === exp.paidBy);
                  return (
                    <div key={exp._id} className="flex items-center justify-between py-3 group">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {exp.title}
                        </p>
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          Paid by <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{payer?.userId === user?._id ? 'You' : payer?.name || 'Unknown'}</span> · {formatDate(exp.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-[16px] font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                          {formatCurrency(exp.amount)}
                        </span>
                        {!isSettled && (exp.addedBy === user?._id || isAdmin) && (
                          <button
                            onClick={() => setDeleteExpenseId(exp._id)}
                            className="p-1.5 rounded-full md:opacity-0 group-hover:opacity-100 transition-opacity tap-effect"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-surface-alt)' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Total</span>
              <span className="text-[18px] font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
                {formatCurrency(settlement.totalExpense)}
              </span>
            </div>
          </div>
        )}

        {/* Settlement Panel */}
        {expenses.length > 0 && (
          <div className="split-card">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Settlement Breakdown</span>
            </div>

            {/* Per-person balance cards */}
            <div className="px-6 py-4 space-y-2">
              <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Equal share per person: {formatCurrency(settlement.fairShare)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {settlement.balances.map((b) => (
                  <div
                    key={b.userId}
                    className="split-balance-card"
                    style={{
                      borderColor: b.balance > 0.01 ? 'var(--color-success)' : b.balance < -0.01 ? 'var(--color-danger)' : 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="split-avatar-sm" style={{ backgroundColor: 'var(--color-text-muted)', color: 'var(--color-surface)' }}>
                        {b.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--color-text)' }}>
                        {b.userId === user?._id ? 'You' : b.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        Paid {formatCurrency(b.paid)}
                      </p>
                      <p
                        className="text-[14px] font-bold tabular-nums"
                        style={{
                          color: b.balance > 0.01 ? 'var(--color-success)' : b.balance < -0.01 ? 'var(--color-danger)' : 'var(--color-text-muted)',
                        }}
                      >
                        {b.balance > 0.01 ? `+${formatCurrency(b.balance)}` : b.balance < -0.01 ? `-${formatCurrency(Math.abs(b.balance))}` : 'Settled ✓'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer arrows */}
            {settlement.transfers.length > 0 && (
              <div className="px-6 py-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                <p className="text-[12px] font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  Who Pays Whom
                </p>
                <div className="space-y-2">
                  {settlement.transfers.map((t, i) => (
                    <div key={i} className="split-transfer-row">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="split-avatar-sm" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
                          {t.from.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {t.from.userId === user?._id ? 'You' : t.from.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <FiArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-[14px] font-bold tabular-nums split-transfer-amount" style={{ color: 'var(--color-text)' }}>
                          {formatCurrency(t.amount)}
                        </span>
                        <FiArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {t.to.userId === user?._id ? 'You' : t.to.name}
                        </span>
                        <div className="split-avatar-sm" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>
                          {t.to.name?.charAt(0)?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Calculate Toggle */}
            {settlement.advancedBreakdown && (
              <div style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-6 py-3.5 transition-colors tap-effect"
                  style={{ color: 'var(--color-accent)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '15px' }}>🧮</span>
                    <span className="text-[13px] font-semibold">Advanced Calculation</span>
                  </div>
                  <FiChevronDown
                    size={16}
                    style={{
                      transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </button>

                {/* Expanded Advanced Breakdown */}
                {showAdvanced && (
                  <div
                    className="px-6 pb-5 space-y-5"
                    style={{
                      animation: 'slideDown 0.3s ease',
                    }}
                  >
                    {/* Step 1: Equal Share Calculation */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>Step 1</span>
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>Equal Share Calculation</span>
                      </div>
                      <p className="text-[12px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        Each expense is divided equally among {settlement.advancedBreakdown.memberCount} members:
                      </p>
                      <div className="space-y-2">
                        {settlement.advancedBreakdown.perExpenseSplits.map((exp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{ backgroundColor: 'var(--color-surface-alt)' }}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="split-avatar-sm" style={{ backgroundColor: 'var(--color-text-muted)', color: 'var(--color-surface)', flexShrink: 0 }}>
                                  {exp.paidByName?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                    {exp.paidByUserId === user?._id ? 'You' : exp.paidByName} — {exp.title}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-3 flex-shrink-0">
                              <p className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
                                {formatCurrency(exp.amount)}
                              </p>
                              <p className="text-[11px] tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                                ÷ {settlement.advancedBreakdown.memberCount} = <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{formatCurrency(exp.perPersonShare)}</span> /person
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />

                    {/* Step 2: Individual Payment Breakdown */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>Step 2</span>
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>Individual Payment Breakdown</span>
                      </div>
                      <p className="text-[12px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        How much each person owes to others based on their share:
                      </p>
                      <div className="space-y-3">
                        {settlement.advancedBreakdown.individualBreakdown.map((person) => {
                          const isCurrentUser = person.userId === user?._id;
                          const displayName = isCurrentUser ? 'You' : person.name;
                          const hasOwes = person.owes.length > 0;

                          return (
                            <div
                              key={person.userId}
                              className="rounded-xl overflow-hidden"
                              style={{
                                border: '1px solid var(--color-border-subtle)',
                                backgroundColor: 'var(--color-surface)',
                              }}
                            >
                              {/* Person header */}
                              <div
                                className="flex items-center justify-between px-4 py-3"
                                style={{ backgroundColor: 'var(--color-surface-alt)' }}
                              >
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: '14px' }}>👤</span>
                                  <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>
                                    {displayName}'s Payments
                                  </span>
                                </div>
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}>
                                  Paid {formatCurrency(person.totalPaid)}
                                </span>
                              </div>

                              {/* Owes list */}
                              <div className="px-4 py-3">
                                {hasOwes ? (
                                  <div className="space-y-2">
                                    {person.owes.map((owe, idx) => {
                                      const toName = owe.toUserId === user?._id ? 'You' : owe.toName;
                                      return (
                                        <div key={idx}>
                                          <p className="text-[12px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                            To {toName} → {formatCurrency(owe.iOweThemShare)} − {formatCurrency(owe.theyOweMeShare)} = <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{formatCurrency(owe.netAmount)}</span>
                                          </p>
                                        </div>
                                      );
                                    })}
                                    {/* Summary */}
                                    <div
                                      className="mt-2 pt-2 space-y-1"
                                      style={{ borderTop: '1px dashed var(--color-border-subtle)' }}
                                    >
                                      <p className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                                        👉 So, {displayName} pay{isCurrentUser ? '' : 's'}:
                                      </p>
                                      {person.owes.map((owe, idx) => {
                                        const toName = owe.toUserId === user?._id ? 'You' : owe.toName;
                                        return (
                                          <div key={idx} className="flex items-center gap-2 pl-4">
                                            <FiArrowRight size={11} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                                            <span className="text-[12px] font-medium" style={{ color: 'var(--color-text)' }}>
                                              <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{formatCurrency(owe.netAmount)}</span> to {toName}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '14px' }}>✅</span>
                                    <p className="text-[12px] font-medium" style={{ color: 'var(--color-success)' }}>
                                      {displayName} {isCurrentUser ? 'don\'t' : 'doesn\'t'} need to pay anyone — already paid the highest amount!
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {expenses.length === 0 && !detailLoading && (
          <div className="split-card px-6 py-12 text-center">
            <p className="text-[28px] mb-2">🧾</p>
            <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              No expenses yet
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Add your first shared expense to start splitting
            </p>
          </div>
        )}

        {/* Modals */}
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteGroup}
          title="Delete Group"
          message="This will permanently delete the group and all its expenses. This cannot be undone."
        />
        <ConfirmModal
          isOpen={!!leaveId}
          onClose={() => setLeaveId(null)}
          onConfirm={handleLeaveGroup}
          title="Leave Group"
          message="You will no longer have access to this group's expenses and settlement."
          confirmLabel="Leave"
          confirmColor="var(--color-danger)"
        />
        <ConfirmModal
          isOpen={!!settleId}
          onClose={() => setSettleId(null)}
          onConfirm={handleSettleGroup}
          title="Settle Group"
          message="Once settled, no one can add, edit, or delete expenses. The settlement breakdown will be locked. Continue?"
          confirmLabel="Settle"
          confirmColor="#22c55e"
        />
        <ConfirmModal
          isOpen={!!deleteExpenseId}
          onClose={() => setDeleteExpenseId(null)}
          onConfirm={handleDeleteExpense}
          title="Delete Expense"
          message="This action cannot be undone."
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  GROUP LIST VIEW
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      <div className="split-card">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Split Groups
            </span>
            <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }}>
              {groups.length}
            </span>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="p-1.5 rounded-full transition-colors tap-effect"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <FiPlus size={18} />
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="px-6 py-4 space-y-3" style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-surface-alt)' }}>
            <input
              type="text"
              placeholder='Group name (e.g. "Goa Trip 2026")'
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
              maxLength={60}
              className="w-full px-4 py-2.5 text-[15px] rounded-xl outline-none"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-colors disabled:opacity-50 tap-effect"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
              >
                {creating ? '...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewGroupName(''); }}
                className="px-5 py-2.5 text-[14px] font-semibold rounded-xl transition-colors tap-effect"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Groups list */}
        <div className="px-6 py-2">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
            </div>
          ) : groups.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[32px] mb-2">👥</p>
              <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                No split groups yet
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Create a group and invite friends to split expenses
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {groups.map((g) => (
                <button
                  key={g._id}
                  onClick={() => setActiveGroup(g._id)}
                  className="w-full flex items-center justify-between py-4 text-left transition-colors tap-effect"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {g.name}
                      </p>
                      {g.isSettled && (
                        <span className="split-badge split-badge-settled">
                          <FiLock size={9} /> Settled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[12px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <FiUsers size={11} /> {g.members.length}
                      </span>
                      <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                        {g.expenseCount} expense{g.expenseCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-[16px] font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                      {formatCurrency(g.expenseTotal)}
                    </span>
                    <FiChevronLeft size={16} style={{ color: 'var(--color-text-muted)', transform: 'rotate(180deg)' }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitGroupSection;
