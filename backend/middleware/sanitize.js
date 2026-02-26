/**
 * Input sanitization middleware
 * Strips dangerous characters and prevents common injection attacks
 */

/**
 * Recursively sanitize an object — remove keys starting with $ or containing .
 * This prevents NoSQL injection via query operators like $gt, $ne, etc.
 */
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    // Block MongoDB operators and dot notation injection
    if (key.startsWith('$') || key.includes('.')) continue;

    const value = obj[key];
    if (typeof value === 'string') {
      // Strip null bytes and trim
      clean[key] = value.replace(/\0/g, '').trim();
    } else if (typeof value === 'object') {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

/**
 * XSS sanitization — strip HTML tags from string values
 */
const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
};

const sanitizeStrings = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeStrings);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      clean[key] = stripHtml(value);
    } else if (typeof value === 'object') {
      clean[key] = sanitizeStrings(value);
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
  if (req.body) {
    req.body = sanitizeStrings(sanitizeObject(req.body));
  }
  if (req.query) {
    req.query = sanitizeStrings(sanitizeObject(req.query));
  }
  if (req.params) {
    req.params = sanitizeStrings(sanitizeObject(req.params));
  }
  next();
};

module.exports = { sanitizeInput, sanitizeObject, stripHtml };
