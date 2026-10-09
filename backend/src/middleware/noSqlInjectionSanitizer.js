import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

/**
 * Checks if a value contains NoSQL operator keys or prototype pollution attempts
 * @param {any} obj
 * @returns {boolean}
 */
function containsInjection(obj, depth = 0) {
  if (depth > 8) return false;
  if (!obj || typeof obj !== 'object') return false;

  for (const key of Object.keys(obj)) {
    // 1. Check for MongoDB/NoSQL operator injection ($ prefix)
    if (key.startsWith('$')) {
      return true;
    }
    // 2. Check for Prototype Pollution attempts
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    // 3. Recurse into nested objects/arrays
    if (typeof obj[key] === 'object' && containsInjection(obj[key], depth + 1)) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes object by stripping any keys starting with $ or matching prototype keywords
 * @param {any} obj
 * @returns {any}
 */
function cleanNoSqlKeys(obj, depth = 0) {
  if (depth > 8) return null;
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => cleanNoSqlKeys(item, depth + 1));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleaned[key] = typeof value === 'object' ? cleanNoSqlKeys(value, depth + 1) : value;
  }
  return cleaned;
}

/**
 * Middleware to sanitize and protect against NoSQL Injection and Prototype Pollution
 */
export function noSqlInjectionSanitizer(req, res, next) {
  if (containsInjection(req.query) || containsInjection(req.params)) {
    logAuditEvent({
      eventType: AuditEventType.SECURITY_VIOLATION,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { threat: 'NoSQL Operator Injection detected in query/params', path: req.originalUrl }
    });
    return ApiResponse.error(res, 'Malicious query syntax detected. Request rejected.', null, 400);
  }

  if (req.body && containsInjection(req.body)) {
    logAuditEvent({
      eventType: AuditEventType.SECURITY_VIOLATION,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { threat: 'NoSQL Operator Injection detected in body', path: req.originalUrl }
    });
    // Sanitize body in-place
    req.body = cleanNoSqlKeys(req.body);
  }

  next();
}
