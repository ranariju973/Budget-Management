import { useState, useEffect } from 'react';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/expenseService';
import { formatCurrency, formatDate, formatDateForInput } from '../../utils/helpers';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const PREVIEW_LIMIT = 3;

const ExpenseSection = ({ month, year, onDataChange, preview = false, onViewAll }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchExpenses(); }, [month, year]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await getExpenses(month, year);
      setExpenses(res.data);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await updateExpense(editingId, payload);
        toast.success('Expense updated');
      } else {
        await createExpense(payload);
        toast.success('Expense added');
      }
      resetForm();
      fetchExpenses();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      date: formatDateForInput(expense.date),
    });
    setEditingId(expense._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(deleteId);
      toast.success('Expense deleted');
      setDeleteId(null);
      fetchExpenses();
      onDataChange();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const displayItems = preview ? expenses.slice(0, PREVIEW_LIMIT) : expenses;

  return (
    <div className="rounded-[24px] overflow-hidden card-shadow liquid-panel liquid-reveal flex flex-col" style={{ border: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>Expenses</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }}>
            {expenses.length}
          </span>
        </div>
        {!preview && (
          <button
            onClick={handleAdd}
            className="p-1.5 rounded-full transition-colors tap-effect"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          >
            <FiPlus size={18} />
          </button>
        )}
      </div>

      {/* Form */}
      {!preview && showForm && (
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3 liquid-soft" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <input
            type="text"
            placeholder="Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
            className="w-full px-4 py-2.5 text-[15px] rounded-xl outline-none"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Amount"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="flex-1 px-4 py-2.5 text-[15px] rounded-xl outline-none"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="flex-1 px-4 py-2.5 text-[15px] rounded-xl outline-none"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-colors disabled:opacity-50 tap-effect"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
            >
              {submitting ? '...' : editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 text-[14px] font-semibold rounded-xl transition-colors tap-effect"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List — scrollable when more than 7 items */}
      <div className="px-6 py-2 overflow-y-auto" style={{ maxHeight: !preview && expenses.length > 7 ? '340px' : 'none' }}>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
          </div>
        ) : expenses.length === 0 ? (
          <p className="py-8 text-center text-[14px]" style={{ color: 'var(--color-text-muted)' }}>No expenses yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {displayItems.map((expense) => (
              <div key={expense._id} className="flex items-center justify-between py-3.5 group">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium truncate" style={{ color: 'var(--color-text)' }}>{expense.title}</p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{formatDate(expense.date)}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[16px] font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(expense.amount)}
                  </span>
                  {!preview && (
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(expense)} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tap-effect" style={{ color: 'var(--color-text-secondary)' }}>
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(expense._id)} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tap-effect" style={{ color: 'var(--color-danger)' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {expenses.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 mt-auto liquid-soft" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <span className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Total</span>
          <span className="text-[18px] font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{formatCurrency(total)}</span>
        </div>
      )}
      {preview && expenses.length > PREVIEW_LIMIT && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-4 text-[14px] font-semibold transition-colors mt-auto tap-effect"
          style={{ borderTop: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--liquid-panel-soft)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          View all {expenses.length} expenses →
        </button>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="This action cannot be undone."
      />
    </div>
  );
};

export default ExpenseSection;
