/**
 * Request sanitizer against NoSQL operator injection and prototype pollution.
 *
 * Removes any key that starts with "$" or contains "." (MongoDB operators and
 * path syntax) plus the special keys __proto__, constructor and prototype.
 * Mutates in place, so it works for body, query and params.
 */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeValue(value) {
  if (Array.isArray(value)) {
    value.forEach(sanitizeValue);
    return value;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.') || FORBIDDEN_KEYS.has(key)) {
        delete value[key];
      } else {
        sanitizeValue(value[key]);
      }
    }
  }
  return value;
}

export function sanitizeInput(req, res, next) {
  sanitizeValue(req.body);
  sanitizeValue(req.query);
  sanitizeValue(req.params);
  next();
}
