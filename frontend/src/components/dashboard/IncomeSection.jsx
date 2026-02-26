import { useState, useEffect } from 'react';
import { getIncome, createIncome, updateIncome } from '../../services/incomeService';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const IncomeSection = ({ month, year, onDataChange }) => {
  const [income, setIncome] = useState(null);
  const [amount, setAmount] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchIncome(); }, [month, year]);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await getIncome(month, year);
      if (res.data.length > 0) {
        setIncome(res.data[0]);
        setAmount(res.data[0].amount.toString());
      } else {
        setIncome(null);
        setAmount('');
      }
    } catch {
      toast.error('Failed to load income');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) < 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      if (income) {
        await updateIncome(income._id, { amount: parseFloat(amount) });
        toast.success('Income updated');
      } else {
        await createIncome({ amount: parseFloat(amount), month, year });
        toast.success('Income added');
      }
      setEditing(false);
      fetchIncome();
      onDataChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setAmount(income ? income.amount.toString() : '');
  };

  if (loading) {
    return (
      <div
        className="rounded-xl p-5 animate-pulse"
        style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
      >
        <div className="h-4 rounded w-28 mb-3" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="h-8 rounded w-24" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Monthly Income
        </span>
        {income && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          >
            <FiEdit2 size={14} />
          </button>
        )}
      </div>

      {!income || editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            autoFocus
            className="flex-1 max-w-50 px-3 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-strong)',
              color: 'var(--color-text)',
            }}
          />
          <button
            onClick={handleSave}
            disabled={submitting}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-surface)' }}
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-surface)', borderTopColor: 'transparent' }} />
            ) : (
              <FiCheck size={14} />
            )}
          </button>
          {editing && (
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      ) : (
        <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
          {formatCurrency(income.amount)}
        </p>
      )}
    </div>
  );
};

export default IncomeSection;
