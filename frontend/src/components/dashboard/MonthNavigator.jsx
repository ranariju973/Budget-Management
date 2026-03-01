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
    <div className="mn">
      <div className="mn-controls">
        <button onClick={goPrev} className="mn-arrow" aria-label="Previous month">
          <FiChevronLeft />
        </button>

        <div className="mn-display">
          <span className="mn-month">{monthNames[month - 1]}</span>
          <span className="mn-year">{year}</span>
        </div>

        <button
          onClick={goNext}
          className="mn-arrow"
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          <FiChevronRight />
        </button>
      </div>

      {!isCurrentMonth && (
        <button onClick={goToday} className="mn-today" aria-label="Go to current month">
          <FiCalendar size={13} />
          <span>Today</span>
        </button>
      )}
    </div>
  );
});

MonthNavigator.displayName = 'MonthNavigator';
export default MonthNavigator;
