import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCalendar, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SearchBar from './SearchBar';
import { searchAll } from '../../services/searchService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TYPE_CONFIG = {
  expense: { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', label: 'Expense' },
  borrow: { color: '#ea580c', bg: 'rgba(234,88,12,0.08)', label: 'Borrowed' },
  lend: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', label: 'Lent' },
};

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Highest amount' },
  { value: 'amount_asc', label: 'Lowest amount' },
];

const SearchResults = ({ onClose, initialQuery }) => {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    month: '',
    year: '',
    date: '',
    from: '',
    to: '',
    sort: 'date_desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const executeSearch = useCallback(async (query, page = 1, currentFilters = filters) => {
    if (!query && !currentFilters.date && !currentFilters.month && !currentFilters.year && !currentFilters.from && !currentFilters.to) {
      return;
    }

    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (query) params.q = query;
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.date) params.date = currentFilters.date;
      if (currentFilters.month) params.month = currentFilters.month;
      if (currentFilters.year) params.year = currentFilters.year;
      if (currentFilters.from) params.from = currentFilters.from;
      if (currentFilters.to) params.to = currentFilters.to;
      if (currentFilters.sort) params.sort = currentFilters.sort;

      const res = await searchAll(params);
      setResults(res.data.results || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch {
      setResults([]);
      setPagination({ page: 1, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    executeSearch(query, 1);
  };

  // Auto-trigger search when initialQuery is provided (from ExpandingSearchDock)
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      executeSearch(initialQuery, 1);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    // Clear conflicting date filters
    if (key === 'date') {
      newFilters.from = '';
      newFilters.to = '';
      newFilters.month = '';
      newFilters.year = '';
    } else if (key === 'from' || key === 'to') {
      newFilters.date = '';
    } else if (key === 'month' || key === 'year') {
      newFilters.date = '';
      newFilters.from = '';
      newFilters.to = '';
    }
    setFilters(newFilters);
    if (searchQuery || newFilters.date || newFilters.month || newFilters.year || newFilters.from || newFilters.to) {
      executeSearch(searchQuery, 1, newFilters);
    }
  };

  const handlePageChange = (newPage) => {
    executeSearch(searchQuery, newPage);
  };

  const clearFilters = () => {
    const cleared = { type: '', month: '', year: '', date: '', from: '', to: '', sort: 'date_desc' };
    setFilters(cleared);
    if (searchQuery) executeSearch(searchQuery, 1, cleared);
  };

  const hasActiveFilters = filters.type || filters.date || filters.month || filters.year || filters.from || filters.to;

  // Generate year options (current year down to 5 years ago)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} onClose={onClose} />

      {/* Filter Toggle & Sort */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: hasActiveFilters ? 'var(--color-accent)' : 'var(--color-surface-hover)',
              color: hasActiveFilters ? 'var(--color-surface)' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <FiFilter size={12} />
            Filters{hasActiveFilters ? ' (active)' : ''}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-2 py-1 rounded hover:opacity-70"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Clear all
            </button>
          )}
        </div>

        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg outline-none"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="rounded-lg p-4 space-y-3"
          style={{ backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Type filter */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              >
                <option value="">All types</option>
                <option value="expense">Expenses</option>
                <option value="borrow">Borrowings</option>
                <option value="lend">Lendings</option>
              </select>
            </div>

            {/* Month filter */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              >
                <option value="">Any month</option>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year filter */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              >
                <option value="">Any year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Exact date */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Exact Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-10">
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }}
          />
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {/* Result count */}
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {pagination.total} result{pagination.total !== 1 ? 's' : ''} found
            {searchQuery && <> for "<span className="font-medium" style={{ color: 'var(--color-text)' }}>{searchQuery}</span>"</>}
          </p>

          {/* Result cards */}
          {results.map((item) => {
            const config = TYPE_CONFIG[item._type] || TYPE_CONFIG.expense;
            return (
              <div
                key={`${item._type}-${item._id}`}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: config.bg, border: `1px solid ${config.color}15` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: config.color, color: '#fff' }}
                  >
                    {item._label?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {item._label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ backgroundColor: `${config.color}18`, color: config.color }}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <FiCalendar size={10} />
                        {formatDate(item.date)}
                      </span>
                      {item.reason && (
                        <span className="text-xs truncate max-w-32" style={{ color: 'var(--color-text-muted)' }}>
                          {item.reason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold flex-shrink-0 ml-3" style={{ color: config.color }}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              >
                <FiChevronLeft size={14} />
              </button>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : searchQuery || hasActiveFilters ? (
        <div className="text-center py-10">
          <FiSearch size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
          <p className="text-sm mt-3 font-medium" style={{ color: 'var(--color-text)' }}>No results found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Try different keywords or adjust your filters
          </p>
        </div>
      ) : (
        <div className="text-center py-10">
          <FiSearch size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
          <p className="text-sm mt-3 font-medium" style={{ color: 'var(--color-text)' }}>Search your transactions</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Search by name, date, month, year, or amount
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
