import { useState, useEffect } from 'react';
import {
  getLends,
  createLend,
  updateLend,
  deleteLend,
} from '../../services/lendService';
import { formatCurrency, formatDate, formatDateForInput } from '../../utils/helpers';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PREVIEW_LIMIT = 3;

const LendSection = ({ month, year, onDataChange, preview = false, onViewAll }) => {
  const [lends, setLends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  useEffect(() => { fetchLends(); }, [month, year]);

  const fetchLends = async () => {
    setLoading(true);
    try {
      const res = await getLends(month, year);
      setLends(res.data);
    } catch {
      toast.error('Failed to load lends');
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
        await updateLend(editingId, payload);
        toast.success('Updated');
      } else {
        await createLend(payload);
        toast.success('Added');
      }
      resetForm();
      fetchLends();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (l) => {
    setFormData({ personName: l.personName, amount: l.amount.toString(), date: formatDateForInput(l.date), reason: l.reason || '' });
    setEditingId(l._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await deleteLend(deleteId);
      toast.success('Deleted');
      setDeleteId(null);
      fetchLends();
      onDataChange();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const total = lends.reduce((sum, l) => sum + l.amount, 0);
  const displayItems = preview ? lends.slice(0, PREVIEW_LIMIT) : lends;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Lending</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>
            {lends.length}
          </span>
        </div>
        {!preview && (
          <button
            onClick={handleAdd}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <FiPlus size={16} />
          </button>
        )}
      </div>

      {/* Form */}
      {!preview && showForm && (
        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <input
            type="text"
            placeholder="Person name"
            value={formData.personName}
            onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="flex-1 px-3 py-2 text-sm rounded-lg"
              style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="flex-1 px-3 py-2 text-sm rounded-lg"
              style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <input
            type="text"
            placeholder="Reason for lending"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
            >
              {submitting ? '...' : editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="py-6 flex justify-center">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
          </div>
        ) : lends.length === 0 ? (
          <p className="py-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No lends yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {displayItems.map((l) => (
              <div key={l._id} className="flex items-center justify-between py-2.5 group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{l.personName}</p>
                  {l.reason && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>{l.reason}</p>}
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{formatDate(l.date)}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(l.amount)}
                  </span>
                  {!preview && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(l)} className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
                        <FiEdit2 size={12} />
                      </button>
                      <button onClick={() => setDeleteId(l._id)} className="p-1 rounded" style={{ color: 'var(--color-danger)' }}>
                        <FiTrash2 size={12} />
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
      {lends.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Total</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{formatCurrency(total)}</span>
        </div>
      )}
      {preview && lends.length > PREVIEW_LIMIT && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-2.5 text-xs font-medium transition-colors"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        >
          View all {lends.length} lends →
        </button>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lend"
        message="This action cannot be undone."
      />
    </div>
  );
};

export default LendSection;
