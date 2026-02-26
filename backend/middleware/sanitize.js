/**
 * Input sanitization middleware — single-pass O(n) tree walker
 * Combines NoSQL injection prevention + XSS stripping + null-byte removal
 * into one recursive traversal instead of two separate passes.
 */

const HTML_TAG_RE = /<[^>]*>/g;
const LOOSE_ANGLE_RE = /[<>]/g;
const NULL_BYTE_RE = /\0/g;

/**
 * Strip HTML tags from a string value — O(n) where n = string length
 */
const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(HTML_TAG_RE, '').replace(LOOSE_ANGLE_RE, '');
};

/**
 * Single-pass recursive sanitizer — O(n) where n = total nodes in object tree
 * - Strips keys starting with '$' or containing '.' (NoSQL injection)
 * - Removes null bytes, trims strings (injection prevention)
 * - Strips HTML tags (XSS prevention)
 * All in one traversal instead of two separate tree walks.
 */
const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean = Object.create(null); // O(1) prototype-free object
  const keys = Object.keys(obj);
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    // Block MongoDB operators ($gt, $ne, etc.) and dot notation injection
    if (key.charCodeAt(0) === 36 /* $ */ || key.indexOf('.') !== -1) continue;

    const value = obj[key];
    if (typeof value === 'string') {
      // Single pass: strip null bytes → trim → strip HTML
      clean[key] = stripHtml(value.replace(NULL_BYTE_RE, '').trim());
    } else if (typeof value === 'object') {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

/**
 * Express middleware — sanitize req.body, req.query, req.params
 */
const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = { sanitizeInput, sanitize, stripHtml };
