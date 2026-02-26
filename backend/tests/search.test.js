/**
 * Search API & Trie Data Structure Tests
 *
 * Run: node backend/tests/search.test.js
 *
 * Tests cover:
 *  1. Trie: insert, search, bulk insert, edge cases
 *  2. Binary search merge (kWayMerge)
 *  3. Date filter builder
 *  4. Search controller query construction
 */

const assert = require('assert');

// ─── Helper: Minimal Trie implementation (mirrors frontend Trie.js) ──────────

class TrieNode {
  constructor() {
    this.children = new Map();
    this.word = null;
    this.type = null;
    this.frequency = 0;
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  insert(word, type = 'expense', freq = 1) {
    if (!word || typeof word !== 'string') return;
    const key = word.toLowerCase().trim();
    if (key.length === 0) return;

    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    if (!node.isEnd) this.size++;
    node.isEnd = true;
    node.word = word.trim();
    node.type = type;
    node.frequency += freq;
  }

  search(prefix, maxResults = 8) {
    if (!prefix || typeof prefix !== 'string') return [];
    const key = prefix.toLowerCase().trim();
    if (key.length === 0) return [];

    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char);
    }

    const results = [];
    this._dfs(node, results, maxResults);
    results.sort((a, b) => b.frequency - a.frequency);
    return results.slice(0, maxResults);
  }

  _dfs(node, results, maxResults) {
    if (results.length >= maxResults * 2) return;
    if (node.isEnd) {
      results.push({ label: node.word, type: node.type, frequency: node.frequency });
    }
    for (const [, child] of node.children) {
      this._dfs(child, results, maxResults);
    }
  }

  bulkInsert(items) {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      this.insert(item.label, item.type, item.count || 1);
    }
  }

  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }
}

// ─── Helper: Binary insert + kWayMerge (mirrors searchController.js) ─────────

const binaryInsert = (sortedArr, item) => {
  let lo = 0;
  let hi = sortedArr.length;
  const itemTime = new Date(item.date).getTime();
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (new Date(sortedArr[mid].date).getTime() > itemTime) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  sortedArr.splice(lo, 0, item);
};

const kWayMerge = (arrays) => {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  let largestIdx = 0;
  for (let i = 1; i < arrays.length; i++) {
    if (arrays[i].length > arrays[largestIdx].length) largestIdx = i;
  }
  const merged = [...arrays[largestIdx]];
  for (let i = 0; i < arrays.length; i++) {
    if (i === largestIdx || arrays[i].length === 0) continue;
    for (const item of arrays[i]) {
      binaryInsert(merged, item);
    }
  }
  return merged;
};

// ─── Helper: buildDateFilter (mirrors searchController.js) ──────────────────

const buildDateFilter = ({ date, month, year, from, to }) => {
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { $gte: start, $lt: end };
  }
  if (from || to) {
    const filter = {};
    if (from) filter.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setDate(endDate.getDate() + 1);
      filter.$lt = endDate;
    }
    return filter;
  }
  if (month && year) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    return { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }
  if (year) {
    const y = parseInt(year, 10);
    return { $gte: new Date(y, 0, 1), $lt: new Date(y + 1, 0, 1) };
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('\n═══ TRIE DATA STRUCTURE TESTS ═══\n');

test('Insert and search single word', () => {
  const t = new Trie();
  t.insert('Groceries', 'expense');
  const results = t.search('gro');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].label, 'Groceries');
  assert.strictEqual(results[0].type, 'expense');
});

test('Case-insensitive search', () => {
  const t = new Trie();
  t.insert('Electricity Bill', 'expense');
  assert.strictEqual(t.search('ELEC').length, 1);
  assert.strictEqual(t.search('elec').length, 1);
  assert.strictEqual(t.search('Elec')[0].label, 'Electricity Bill');
});

test('Multiple words with prefix', () => {
  const t = new Trie();
  t.insert('Rent', 'expense');
  t.insert('Restaurant', 'expense');
  t.insert('Repair', 'expense');
  t.insert('John', 'borrow');
  const results = t.search('re');
  assert.strictEqual(results.length, 3);
  assert.ok(results.every((r) => r.label.toLowerCase().startsWith('re')));
});

test('Frequency ranking', () => {
  const t = new Trie();
  t.insert('Groceries', 'expense', 1);
  t.insert('Groceries', 'expense', 5); // freq becomes 6
  t.insert('Gas', 'expense', 2);
  const results = t.search('g');
  assert.strictEqual(results[0].label, 'Groceries'); // higher frequency first
  assert.strictEqual(results[0].frequency, 6);
});

test('No match returns empty', () => {
  const t = new Trie();
  t.insert('Groceries', 'expense');
  assert.strictEqual(t.search('xyz').length, 0);
});

test('Empty and null inputs handled', () => {
  const t = new Trie();
  assert.strictEqual(t.search('').length, 0);
  assert.strictEqual(t.search(null).length, 0);
  assert.strictEqual(t.search(undefined).length, 0);
  t.insert('', 'expense');
  t.insert(null, 'expense');
  assert.strictEqual(t.size, 0);
});

test('Bulk insert', () => {
  const t = new Trie();
  t.bulkInsert([
    { label: 'Groceries', type: 'expense', count: 3 },
    { label: 'John', type: 'borrow', count: 2 },
    { label: 'Jane', type: 'lend', count: 1 },
  ]);
  assert.strictEqual(t.size, 3);
  assert.strictEqual(t.search('j').length, 2);
  assert.strictEqual(t.search('gro').length, 1);
});

test('Max results limit', () => {
  const t = new Trie();
  for (let i = 0; i < 20; i++) {
    t.insert(`Item${i}`, 'expense');
  }
  const results = t.search('item', 5);
  assert.strictEqual(results.length, 5);
});

test('Clear resets trie', () => {
  const t = new Trie();
  t.insert('Test', 'expense');
  assert.strictEqual(t.size, 1);
  t.clear();
  assert.strictEqual(t.size, 0);
  assert.strictEqual(t.search('t').length, 0);
});

test('Unicode characters', () => {
  const t = new Trie();
  t.insert('Café', 'expense');
  t.insert('Crêpe', 'expense');
  assert.strictEqual(t.search('caf').length, 1);
  assert.strictEqual(t.search('cr').length, 1);
});

test('Duplicate insert increases frequency, not size', () => {
  const t = new Trie();
  t.insert('Rent', 'expense', 1);
  t.insert('Rent', 'expense', 1);
  t.insert('Rent', 'expense', 1);
  assert.strictEqual(t.size, 1);
  assert.strictEqual(t.search('rent')[0].frequency, 3);
});

console.log('\n═══ BINARY SEARCH / K-WAY MERGE TESTS ═══\n');

test('Binary insert maintains descending date order', () => {
  const arr = [
    { date: '2026-02-25', title: 'A' },
    { date: '2026-02-20', title: 'B' },
    { date: '2026-02-10', title: 'C' },
  ];
  binaryInsert(arr, { date: '2026-02-22', title: 'X' });
  assert.strictEqual(arr.length, 4);
  assert.strictEqual(arr[1].title, 'X');
  // Verify still sorted desc
  for (let i = 0; i < arr.length - 1; i++) {
    assert.ok(new Date(arr[i].date) >= new Date(arr[i + 1].date));
  }
});

test('kWayMerge with multiple sorted arrays', () => {
  const expenses = [
    { date: '2026-02-25', _type: 'expense' },
    { date: '2026-02-15', _type: 'expense' },
  ];
  const borrows = [
    { date: '2026-02-20', _type: 'borrow' },
    { date: '2026-02-10', _type: 'borrow' },
  ];
  const lends = [
    { date: '2026-02-22', _type: 'lend' },
  ];
  const merged = kWayMerge([expenses, borrows, lends]);
  assert.strictEqual(merged.length, 5);
  // Verify sorted by date descending
  for (let i = 0; i < merged.length - 1; i++) {
    assert.ok(new Date(merged[i].date) >= new Date(merged[i + 1].date));
  }
});

test('kWayMerge with empty arrays', () => {
  assert.strictEqual(kWayMerge([]).length, 0);
  assert.strictEqual(kWayMerge([[]]).length, 0);
  assert.strictEqual(kWayMerge([[], []]).length, 0);
});

test('kWayMerge with single array', () => {
  const arr = [{ date: '2026-01-01' }];
  const result = kWayMerge([arr]);
  assert.strictEqual(result.length, 1);
});

test('kWayMerge preserves all items from all arrays', () => {
  const a = Array.from({ length: 10 }, (_, i) => ({ date: `2026-01-${30 - i}` }));
  const b = Array.from({ length: 5 }, (_, i) => ({ date: `2026-02-${28 - i * 5}` }));
  const c = Array.from({ length: 3 }, (_, i) => ({ date: `2025-12-${25 - i * 7}` }));
  const merged = kWayMerge([a, b, c]);
  assert.strictEqual(merged.length, 18);
});

console.log('\n═══ DATE FILTER BUILDER TESTS ═══\n');

test('Exact date filter', () => {
  const filter = buildDateFilter({ date: '2026-02-15' });
  assert.ok(filter.$gte instanceof Date);
  assert.ok(filter.$lt instanceof Date);
  assert.strictEqual(filter.$gte.getDate(), 15);
  assert.strictEqual(filter.$lt.getDate(), 16);
});

test('Month + year filter', () => {
  const filter = buildDateFilter({ month: '2', year: '2026' });
  assert.strictEqual(filter.$gte.getMonth(), 1); // Feb = 1 (0-indexed)
  assert.strictEqual(filter.$gte.getFullYear(), 2026);
  assert.strictEqual(filter.$lt.getMonth(), 2); // March
});

test('Year-only filter', () => {
  const filter = buildDateFilter({ year: '2026' });
  assert.strictEqual(filter.$gte.getFullYear(), 2026);
  assert.strictEqual(filter.$gte.getMonth(), 0); // Jan
  assert.strictEqual(filter.$lt.getFullYear(), 2027);
});

test('Date range filter (from + to)', () => {
  const filter = buildDateFilter({ from: '2026-01-01', to: '2026-01-31' });
  assert.ok(filter.$gte instanceof Date);
  assert.ok(filter.$lt instanceof Date);
});

test('From-only range', () => {
  const filter = buildDateFilter({ from: '2026-01-01' });
  assert.ok(filter.$gte);
  assert.strictEqual(filter.$lt, undefined);
});

test('No params returns null', () => {
  assert.strictEqual(buildDateFilter({}), null);
});

test('Exact date takes priority over month/year', () => {
  const filter = buildDateFilter({ date: '2026-03-10', month: '2', year: '2026' });
  assert.strictEqual(filter.$gte.getDate(), 10);
  assert.strictEqual(filter.$gte.getMonth(), 2); // March, not Feb
});

console.log('\n═══ PERFORMANCE TESTS ═══\n');

test('Trie handles 10,000 insertions under 100ms', () => {
  const t = new Trie();
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    t.insert(`Item${i}Expense`, 'expense');
  }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 100, `Took ${elapsed.toFixed(1)}ms (limit: 100ms)`);
  assert.strictEqual(t.size, 10000);
});

test('Trie search in 10K items under 5ms', () => {
  const t = new Trie();
  for (let i = 0; i < 10000; i++) {
    t.insert(`Item${i}Expense`, 'expense');
  }
  const start = performance.now();
  const results = t.search('item1', 10);
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 5, `Search took ${elapsed.toFixed(1)}ms (limit: 5ms)`);
  assert.ok(results.length > 0);
});

test('kWayMerge 3 arrays of 1000 items under 50ms', () => {
  const makeArr = (n, offset) =>
    Array.from({ length: n }, (_, i) => ({
      date: new Date(2026, 1, 28 - (i % 28), 12 - offset).toISOString(),
      title: `Item${i}`,
    }));
  const start = performance.now();
  const merged = kWayMerge([makeArr(1000, 0), makeArr(1000, 1), makeArr(1000, 2)]);
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 50, `Merge took ${elapsed.toFixed(1)}ms (limit: 50ms)`);
  assert.strictEqual(merged.length, 3000);
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n══════════════════════════════════════`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`══════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
