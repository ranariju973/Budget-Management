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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-[24px] p-5 animate-pulse card-shadow liquid-panel"
            style={{ border: 'none' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
              <div className="h-3 rounded w-16" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
            </div>
            <div className="h-6 rounded w-20" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isBalance = idx === 4;
        const isPositive = card.value >= 0;
        return (
          <div
            key={card.label}
            className={`rounded-[24px] p-5 transition-all duration-200 liquid-reveal ${isBalance ? 'liquid-soft' : 'card-shadow liquid-panel tap-effect'}`}
            style={{
              backgroundColor: isBalance ? 'var(--liquid-panel-strong)' : 'var(--liquid-panel)',
              border: isBalance ? '1px solid var(--color-border-subtle)' : 'none',
              color: isBalance ? 'var(--color-surface)' : 'var(--color-text)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center p-1"
                style={{ backgroundColor: isBalance ? 'var(--color-surface-hover)' : 'var(--color-surface-alt)', 
                         opacity: isBalance ? 0.25 : 1 }}
              >
                <Icon
                  size={14}
                  style={{ color: 'var(--color-text-secondary)' }}
                />
              </div>
              <span
                className="text-[13px] font-semibold tracking-tight"
                style={{ color: 'var(--color-text-secondary)', opacity: isBalance ? 0.9 : 1 }}
              >
                {card.label}
              </span>
            </div>
            <p
              className="text-2xl font-bold tracking-tight tabular-nums mt-1"
              style={{ color: 'var(--color-text)' }}
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
