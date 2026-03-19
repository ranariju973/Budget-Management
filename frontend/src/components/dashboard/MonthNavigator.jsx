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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <h2 className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          {monthNames[month - 1]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={goPrev} 
            className="p-2 rounded-full tap-effect" 
            aria-label="Previous month"
            style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
          >
            <FiChevronLeft size={20} />
          </button>

          <button
            onClick={goNext}
            className="p-2 rounded-full tap-effect disabled:opacity-30"
            disabled={isCurrentMonth}
            aria-label="Next month"
            style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {!isCurrentMonth && (
        <button 
          onClick={goToday} 
          className="self-start sm:self-auto px-4 py-2 text-[14px] font-semibold rounded-full tap-effect" 
          aria-label="Go to current month"
          style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
        >
          Today
        </button>
      )}
    </div>
  );
});

MonthNavigator.displayName = 'MonthNavigator';
export default MonthNavigator;

