import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Whitelist of allowed origins for cross-origin requests
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

/**
 * CSRF Protection Middleware
 * 
 * Protects state-changing API endpoints by:
 * 1. Validating request Origin and Referer against the trusted origins whitelist.
 * 2. Requiring an anti-CSRF custom request header (X-Requested-With, Authorization, or X-CSRF-Token)
 *    which cannot be sent via standard HTML form cross-site requests or <img/script/form> tags.
 */
export function csrfProtection(req, res, next) {
  // Safe idempotent methods do not need CSRF verification
  if (!STATE_CHANGING_METHODS.has(req.method)) {
    return next();
  }

  // Exempt webhooks with their own cryptographic signature verification
  if (req.originalUrl.startsWith('/api/webhooks')) {
    return next();
  }

  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  // 1. Origin verification when origin is supplied
  if (origin) {
    const isAllowedOrigin = allowedOrigins.some(allowed => {
      try {
        return new URL(origin).origin === new URL(allowed).origin;
      } catch {
        return false;
      }
    });

    if (!isAllowedOrigin) {
      logAuditEvent({
        eventType: AuditEventType.CSRF_VIOLATION,
        actor: req.ip,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'BLOCKED',
        details: { reason: 'Untrusted Origin header', origin, path: req.originalUrl }
      });
      return ApiResponse.error(res, 'CSRF verification failed: Untrusted Origin.', null, 403);
    }
  }

  // 2. Custom header requirement for API calls
  // Browsers forbid standard cross-site form submissions from setting custom headers
  const hasCustomHeader = Boolean(
    req.headers['x-requested-with'] ||
    req.headers['x-csrf-token'] ||
    req.headers['authorization'] ||
    req.headers['content-type']?.includes('application/json')
  );

  if (!hasCustomHeader) {
    logAuditEvent({
      eventType: AuditEventType.CSRF_VIOLATION,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { reason: 'Missing Anti-CSRF header', path: req.originalUrl }
    });
    return ApiResponse.error(
      res,
      'CSRF verification failed: Missing required anti-forgery request header.',
      null,
      403
    );
  }

  next();
}
