import { memo, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { monthNames, getCurrentMonthYear } from '../../utils/helpers';

const MonthNavigator = memo(({ month, year, onChange }) => {
  const current = getCurrentMonthYear();
  const isCurrentMonth = month === current.month && year === current.year;

  const goPrev = useCallback(() => {
    const prev = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
    onChange(prev.month, prev.year);
  }, [month, year, onChange]);

  const goNext = useCallback(() => {
    if (isCurrentMonth) return;
    const next = month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };
    onChange(next.month, next.year);
  }, [month, year, isCurrentMonth, onChange]);

  const goToday = useCallback(() => {
    onChange(current.month, current.year);
  }, [current.month, current.year, onChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <div 
        className="flex items-center p-1 rounded-full card-shadow"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
      >
        <button 
          onClick={goPrev} 
          className="p-2 rounded-full transition-colors tap-effect" 
          aria-label="Previous month"
          style={{ color: 'var(--color-text)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <FiChevronLeft size={20} />
        </button>

        <div className="flex items-center justify-center px-6 min-w-[140px]">
          <span className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
            {monthNames[month - 1]} {year}
          </span>
        </div>

        <button
          onClick={goNext}
          className="p-2 rounded-full transition-colors tap-effect"
          disabled={isCurrentMonth}
          aria-label="Next month"
          style={{ 
            color: isCurrentMonth ? 'var(--color-text-muted)' : 'var(--color-text)',
            opacity: isCurrentMonth ? 0.5 : 1
          }}
          onMouseEnter={(e) => { if(!isCurrentMonth) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
          onMouseLeave={(e) => { if(!isCurrentMonth) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {!isCurrentMonth && (
        <button 
          onClick={goToday} 
          className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-full transition-colors tap-effect" 
          aria-label="Go to current month"
          style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
        >
          <FiCalendar size={16} />
          <span>Go to Today</span>
        </button>
      )}
    </div>
  );
});

MonthNavigator.displayName = 'MonthNavigator';
export default MonthNavigator;

