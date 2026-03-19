import { useState, useEffect } from 'react';
import {
  getBorrows,
  createBorrow,
  updateBorrow,
  deleteBorrow,
  markBorrowAsPaid,
} from '../../services/borrowService';
import { formatCurrency, formatDate, formatDateForInput } from '../../utils/helpers';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

const PREVIEW_LIMIT = 3;

const BorrowSection = ({ month, year, onDataChange, preview = false, onViewAll }) => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [markPaidId, setMarkPaidId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  useEffect(() => { fetchBorrows(); }, [month, year]);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const res = await getBorrows(month, year);
      setBorrows(res.data);
    } catch {
      toast.error('Failed to load borrows');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ personName: '', amount: '', date: new Date().toISOString().split('T')[0], reason: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.personName || !formData.amount || !formData.date) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await updateBorrow(editingId, payload);
        toast.success('Updated');
      } else {
        await createBorrow(payload);
        toast.success('Added');
      }
      resetForm();
      fetchBorrows();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b) => {
    setFormData({ personName: b.personName, amount: b.amount.toString(), date: formatDateForInput(b.date), reason: b.reason || '' });
    setEditingId(b._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await deleteBorrow(deleteId);
      toast.success('Deleted');
      setDeleteId(null);
      fetchBorrows();
      onDataChange();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await markBorrowAsPaid(markPaidId);
      toast.success('Marked as paid — added to expenses');
      setMarkPaidId(null);
      fetchBorrows();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const total = borrows.reduce((sum, b) => sum + b.amount, 0);
  const unpaidTotal = borrows.filter((b) => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const displayItems = preview ? borrows.slice(0, PREVIEW_LIMIT) : borrows;

  return (
    <div className="rounded-[24px] overflow-hidden card-shadow flex flex-col" style={{ backgroundColor: 'var(--color-surface)', border: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>Borrowing</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)' }}>
            {borrows.length}
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
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3" style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-surface-alt)' }}>
          <input
            type="text"
            placeholder="Person name"
            value={formData.personName}
            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
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
          <input
            type="text"
            placeholder="Reason for borrowing"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2.5 text-[15px] rounded-xl outline-none"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
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
      <div className="px-6 py-2 overflow-y-auto" style={{ maxHeight: !preview && borrows.length > 7 ? '340px' : 'none' }}>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
          </div>
        ) : borrows.length === 0 ? (
          <p className="py-8 text-center text-[14px]" style={{ color: 'var(--color-text-muted)' }}>No borrows yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {displayItems.map((b) => (
              <div key={b._id} className="flex items-center justify-between py-3.5 group" style={{ opacity: b.isPaid ? 0.6 : 1 }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-medium truncate" style={{ color: 'var(--color-text)', textDecoration: b.isPaid ? 'line-through' : 'none' }}>{b.personName}</p>
                    {b.isPaid && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                        Paid
                      </span>
                    )}
                  </div>
                  {b.reason && <p className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>{b.reason}</p>}
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{formatDate(b.date)}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[16px] font-semibold tabular-nums" style={{ color: 'var(--color-text)', textDecoration: b.isPaid ? 'line-through' : 'none' }}>
                    {formatCurrency(b.amount)}
                  </span>
                  {!preview && (
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!b.isPaid && (
                        <button
                          onClick={() => setMarkPaidId(b._id)}
                          className="p-1.5 rounded-full hover:bg-green-500/10 transition-colors tap-effect"
                          style={{ color: '#22c55e' }}
                          title="Mark as Paid"
                        >
                          <FiCheck size={14} className="stroke-[2.5px]" />
                        </button>
                      )}
                      {!b.isPaid && (
                        <button onClick={() => handleEdit(b)} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tap-effect" style={{ color: 'var(--color-text-secondary)' }}>
                          <FiEdit2 size={14} />
                        </button>
                      )}
                      <button onClick={() => setDeleteId(b._id)} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tap-effect" style={{ color: 'var(--color-danger)' }}>
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
      {borrows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 mt-auto" style={{ borderTop: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-surface-alt)' }}>
          <span className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Unpaid</span>
          <span className="text-[18px] font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{formatCurrency(unpaidTotal)}</span>
        </div>
      )}
      {preview && borrows.length > PREVIEW_LIMIT && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-4 text-[14px] font-semibold transition-colors mt-auto tap-effect"
          style={{ borderTop: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-alt)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          View all {borrows.length} borrows →
        </button>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Borrow"
        message="This action cannot be undone."
      />
      <ConfirmModal
        isOpen={!!markPaidId}
        onClose={() => setMarkPaidId(null)}
        onConfirm={handleMarkAsPaid}
        title="Mark as Paid"
        message="This will add the borrowed amount to your expenses and decrease your balance. Continue?"
        confirmLabel="Confirm"
        confirmColor="#22c55e"
      />
    </div>
  );
};

export default BorrowSection;
