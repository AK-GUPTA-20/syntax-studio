/**
 * Input Sanitization & Anti-Injection Utilities
 * Protects against:
 * - Cross-Site Scripting (XSS)
 * - Prototype Pollution (__proto__, constructor, prototype)
 * - Control Character Injection / Null Byte Injection
 * - Buffer Flooding / ReDoS payload inflation
 */

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;'
};

/**
 * Encodes dangerous HTML entities to neutralize XSS in reflected/stored text
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'/`]/g, char => HTML_ENTITIES[char]);
}

/**
 * Strips HTML tags, script markers, null bytes, control characters, and limits string length.
 * 
 * @param {string} input - Text to sanitize
 * @param {number} [maxLength=5000] - Max allowable length
 * @returns {string}
 */
export function sanitizeInput(input, maxLength = 5000) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  // 1. Remove null bytes and non-printable control characters (keep \r, \n, \t)
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip HTML tags and script/style tags
  cleaned = cleaned.replace(/<[^>]*>?/gm, '');

  // 3. Remove inline javascript/data URI protocol strings
  cleaned = cleaned.replace(/javascript\s*:/gi, '');
  cleaned = cleaned.replace(/vbscript\s*:/gi, '');

  // 4. Bounded length check
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned.trim();
}

/**
 * Deeply sanitizes an object or array.
 * Strips prototype pollution keys and neutralizes dangerous properties.
 * 
 * @param {any} obj
 * @param {number} [depth=0]
 * @returns {any}
 */
export function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return null; // recursion limit
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Prototype pollution defense
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    // Strip NoSQL operator prefixes from keys
    const cleanKey = key.replace(/^\$+/, '').replace(/\./g, '_');

    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[cleanKey] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[cleanKey] = value;
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes URL slugs (e.g. project-name-123)
 * @param {string} slug
 * @returns {string}
 */
export function sanitizeSlug(slug) {
  if (!slug || typeof slug !== 'string') return '';
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Validates and sanitizes standard ID parameter (alphanumeric, hyphens, underscores)
 * @param {string} id
 * @returns {string|null}
 */
export function sanitizeId(id) {
  if (!id || typeof id !== 'string') return null;
  const cleaned = id.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.slice(0, 128) || null;
}
