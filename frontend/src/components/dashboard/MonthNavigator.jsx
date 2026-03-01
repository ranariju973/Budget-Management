import { memo, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { monthNames, getCurrentMonthYear } from '../../utils/helpers';

const MonthNavigator = memo(({ month, year, onChange }) => {
  const current = getCurrentMonthYear();
  const isCurrentMonth = month === current.month && year === current.year;

  const goPrev = useCallback(() => {
    const prev = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
    onChange(prev.month, prev.year);
  }, [month, year, onChange]);

  const goNext = useCallback(() => {
    // Don't allow navigating beyond the current month
    if (isCurrentMonth) return;
    const next = month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };
    onChange(next.month, next.year);
  }, [month, year, isCurrentMonth, onChange]);

  const goToday = useCallback(() => {
    onChange(current.month, current.year);
  }, [current.month, current.year, onChange]);

  return (
    <div className="month-nav">
      <button onClick={goPrev} className="month-nav-btn" aria-label="Previous month">
        <FiChevronLeft size={18} />
      </button>

      <div className="month-nav-label">
        <span className="month-nav-month">{monthNames[month - 1]}</span>
        <span className="month-nav-year">{year}</span>
      </div>

      <button
        onClick={goNext}
        className="month-nav-btn"
        disabled={isCurrentMonth}
        aria-label="Next month"
      >
        <FiChevronRight size={18} />
      </button>

      {!isCurrentMonth && (
        <button onClick={goToday} className="month-nav-today">
          Today
        </button>
      )}
    </div>
  );
});

MonthNavigator.displayName = 'MonthNavigator';
export default MonthNavigator;
