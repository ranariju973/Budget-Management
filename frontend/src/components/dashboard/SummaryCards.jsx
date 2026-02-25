import { useEffect, useState } from 'react';
import { getSummary } from '../../services/summaryService';
import { formatCurrency } from '../../utils/helpers';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiTarget,
} from 'react-icons/fi';

const SummaryCards = ({ month, year, refreshKey }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await getSummary(month, year);
        setSummary(res.data);
      } catch {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [month, year, refreshKey]);

  const cards = [
    { label: 'Income', value: summary?.income || 0, icon: FiTrendingUp, sign: '+' },
    { label: 'Expenses', value: summary?.totalExpenses || 0, icon: FiTrendingDown, sign: '-' },
    { label: 'Borrowed', value: summary?.totalBorrowing || 0, icon: FiArrowDownLeft, sign: '-' },
    { label: 'Lent', value: summary?.totalLent || 0, icon: FiArrowUpRight, sign: '+' },
    { label: 'Balance', value: summary?.remainingBalance || 0, icon: FiTarget, sign: '' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 animate-pulse"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
          >
            <div className="h-3 rounded w-12 mb-3" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="h-6 rounded w-16" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isBalance = idx === 4;
        const isPositive = card.value >= 0;
        return (
          <div
            key={card.label}
            className="rounded-xl p-4 group transition-all duration-200"
            style={{
              backgroundColor: isBalance ? 'var(--color-accent)' : 'var(--color-surface-alt)',
              border: isBalance ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon
                size={14}
                style={{ color: isBalance ? 'var(--color-surface)' : 'var(--color-text-muted)' }}
              />
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: isBalance ? 'var(--color-surface)' : 'var(--color-text-muted)' }}
              >
                {card.label}
              </span>
            </div>
            <p
              className="text-lg font-semibold tabular-nums"
              style={{
                color: isBalance
                  ? 'var(--color-surface)'
                  : 'var(--color-text)',
              }}
            >
              {card.sign}{formatCurrency(Math.abs(card.value))}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
