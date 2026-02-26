/**
 * Trie (Prefix Tree) — Advanced data structure for O(k) prefix autocomplete
 * where k = length of the query prefix.
 *
 * How it works:
 *  - Each node has a Map of children keyed by character
 *  - Terminal nodes store the full word(s) and a frequency counter
 *  - Insertion: O(k) — walk/create path for each char
 *  - Search:   O(k + m) — walk to prefix node, then DFS to collect m matches
 *  - B-tree-like fan-out: each node branches into up to 62 children (a-z, A-Z, 0-9, space, etc.)
 *
 * This gives YouTube-like instant prefix matching on the client side,
 * reducing network calls by caching previously seen suggestions locally.
 */

class TrieNode {
  constructor() {
    /** @type {Map<string, TrieNode>} */
    this.children = new Map();
    /** @type {string|null} */
    this.word = null;
    /** @type {string|null} */
    this.type = null;
    /** @type {number} */
    this.frequency = 0;
    /** @type {boolean} */
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  /**
   * Insert a word into the trie.
   * @param {string} word - The word to insert
   * @param {string} type - Category type (expense/borrow/lend)
   * @param {number} freq - Frequency weight (higher = ranked first)
   * Time: O(k) where k = word.length
   */
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

    // Mark terminal node
    if (!node.isEnd) this.size++;
    node.isEnd = true;
    node.word = word.trim(); // preserve original casing
    node.type = type;
    node.frequency += freq;
  }

  /**
   * Search for all words matching a prefix.
   * Uses DFS from the prefix node to collect results.
   * @param {string} prefix - The prefix to search for
   * @param {number} maxResults - Maximum results to return
   * @returns {Array<{label: string, type: string, frequency: number}>}
   * Time: O(k + m) where k = prefix.length, m = number of matching nodes visited
   */
  search(prefix, maxResults = 8) {
    if (!prefix || typeof prefix !== 'string') return [];

    const key = prefix.toLowerCase().trim();
    if (key.length === 0) return [];

    // Walk to the prefix node
    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) return []; // no match
      node = node.children.get(char);
    }

    // DFS to collect all terminal nodes under this prefix
    const results = [];
    this._dfs(node, results, maxResults);

    // Sort by frequency (most common first) — like YouTube ranking
    results.sort((a, b) => b.frequency - a.frequency);
    return results.slice(0, maxResults);
  }

  /**
   * DFS traversal to collect matching words.
   * @private
   */
  _dfs(node, results, maxResults) {
    if (results.length >= maxResults * 2) return; // collect extra for sorting

    if (node.isEnd) {
      results.push({
        label: node.word,
        type: node.type,
        frequency: node.frequency,
      });
    }

    for (const [, child] of node.children) {
      this._dfs(child, results, maxResults);
    }
  }

  /**
   * Bulk insert from an array of suggestions.
   * @param {Array<{label: string, type: string, count?: number}>} items
   */
  bulkInsert(items) {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      this.insert(item.label, item.type, item.count || 1);
    }
  }

  /**
   * Clear the trie.
   */
  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }
}

export default Trie;
