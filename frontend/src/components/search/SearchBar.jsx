import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FiSearch, FiX, FiClock, FiArrowUpLeft } from 'react-icons/fi';
import Trie from '../../utils/Trie';
import { getSuggestions, getRecentTerms } from '../../services/searchService';

/**
 * SearchBar — YouTube-style search with instant autocomplete.
 *
 * Architecture:
 *  1. Client-side Trie caches all seen suggestions for O(k) prefix lookup
 *  2. Server suggestions fetched on debounce (300ms) for new prefixes
 *  3. Recent terms shown on focus (empty query) — like YouTube
 *  4. Keyboard navigation (Arrow Up/Down + Enter + Escape)
 */
const SearchBar = ({ onSearch, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentTerms, setRecentTerms] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Trie instance — persists across renders via useRef
  const trie = useMemo(() => new Trie(), []);

  // Load recent terms on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await getRecentTerms();
        const terms = res.data.terms || [];
        setRecentTerms(terms);
        // Seed the trie with recent terms
        trie.bulkInsert(terms.map((t) => ({ label: t.label, type: t.type, count: 2 })));
      } catch {
        // Silent fail — recent terms are optional
      }
    };
    loadRecent();
    inputRef.current?.focus();
  }, [trie]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /**
   * Fetch suggestions from server and merge into trie.
   * Debounced to avoid flooding the API.
   */
  const fetchSuggestions = useCallback(async (prefix) => {
    if (!prefix || prefix.length < 1) {
      setSuggestions([]);
      return;
    }

    // Skip redundant trie lookup — handleInputChange already showed instant results
    // Go straight to server fetch for fresh data
    setLoading(true);
    try {
      const res = await getSuggestions(prefix, 8);
      const serverItems = res.data.suggestions || [];

      // Insert server results into trie for future instant lookups
      trie.bulkInsert(serverItems);

      // Single trie query after merge — the only lookup needed
      const merged = trie.search(prefix, 8);
      setSuggestions(merged.length > 0 ? merged : serverItems.map((s) => ({
        label: s.label,
        type: s.type,
        frequency: s.count || 1,
      })));
    } catch {
      // Keep existing suggestions on network error
    } finally {
      setLoading(false);
    }
  }, [trie]);

  // Debounced input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    setShowDropdown(true);

    // Clear previous debounce
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    // Instantly check trie
    const instant = trie.search(value.trim(), 8);
    if (instant.length > 0) {
      setSuggestions(instant);
    }

    // Debounce server fetch (300ms)
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value.trim());
    }, 300);
  };

  // Execute search
  const executeSearch = (searchQuery) => {
    const q = searchQuery?.trim() || query.trim();
    if (!q) return;

    // Insert into trie so it appears in future suggestions
    trie.insert(q, 'search', 3);

    setShowDropdown(false);
    onSearch(q);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const items = query.trim() ? suggestions : recentTerms;
    const len = items.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < len - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : len - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < len) {
          const item = items[activeIndex];
          setQuery(item.label);
          executeSearch(item.label);
        } else {
          executeSearch();
        }
        break;
      case 'Escape':
        if (showDropdown) {
          setShowDropdown(false);
        } else {
          onClose?.();
        }
        break;
      default:
        break;
    }
  };

  // Type badge color
  const typeBadge = (type) => {
    const map = {
      expense: { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', label: 'Expense' },
      borrow: { bg: 'rgba(234,88,12,0.1)', color: '#ea580c', label: 'Borrow' },
      lend: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Lend' },
    };
    return map[type] || { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: type };
  };

  const displayItems = query.trim() ? suggestions : recentTerms;
  const showResults = showDropdown && displayItems.length > 0;

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: showResults ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <FiSearch size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search expenses, borrowings, lendings..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text)' }}
          maxLength={100}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div
            className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }}
          />
        )}
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            className="p-0.5 rounded hover:opacity-70 flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showResults && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          {/* Section header */}
          {!query.trim() && (
            <div className="px-3 py-1.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Recent
              </span>
            </div>
          )}

          {displayItems.map((item, idx) => {
            const badge = typeBadge(item.type);
            const isActive = idx === activeIndex;
            return (
              <button
                key={`${item.label}-${item.type}-${idx}`}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--color-surface-hover)' : 'transparent',
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  setQuery(item.label);
                  executeSearch(item.label);
                }}
              >
                {query.trim() ? (
                  <FiSearch size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                ) : (
                  <FiClock size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                )}
                <span className="flex-1 text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {/* Highlight matching prefix */}
                  {query.trim() && item.label.toLowerCase().startsWith(query.toLowerCase().trim()) ? (
                    <>
                      <span className="font-semibold">{item.label.slice(0, query.trim().length)}</span>
                      {item.label.slice(query.trim().length)}
                    </>
                  ) : (
                    item.label
                  )}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
                {query.trim() && (
                  <FiArrowUpLeft size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
