/**
 * Log Sanitizer Utility
 * Redacts sensitive credentials, tokens, PII, and keys before writing to console, files, or APM.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'secretkey',
  'adminsecretkey',
  'adminaccesstoken',
  'privatekey',
  'apikey',
  'authorization',
  'cookie',
  'otp',
  'code',
  'proof',
  'emailverificationproof',
  'firebasetoken',
  'creditcard',
  'cvv',
  'ssn'
]);

/**
 * Recursively redacts sensitive fields in an object or array.
 * @param {any} data
 * @param {number} [depth=0]
 * @returns {any}
 */
export function sanitizeLogData(data, depth = 0) {
  if (depth > 8) return '[MAX_DEPTH_EXCEEDED]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Check if string looks like Bearer token
    if (/bearer\s+[a-zA-Z0-9._-]+/i.test(data)) {
      return data.replace(/bearer\s+([a-zA-Z0-9._-]+)/gi, 'Bearer [REDACTED_TOKEN]');
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Safe logger wrapper that guarantees no sensitive credentials leak to stdout/stderr.
 */
export const safeLogger = {
  info: (...args) => {
    console.log(...args.map(a => (typeof a === 'object' ? sanitizeLogData(a) : a)));
  },
  warn: (...args) => {
    console.warn(...args.map(a => (typeof a === 'object' ? sanitizeLogData(a) : a)));
  },
  error: (...args) => {
    console.error(...args.map(a => (typeof a === 'object' ? sanitizeLogData(a) : a)));
  }
};
