import { FirestoreService } from './firestoreService.js';
import { safeLogger } from '../utils/logSanitizer.js';

const auditDb = new FirestoreService('auditLogs');

// In-memory ring buffer (up to 200 recent events) for immediate failover / fast dashboard retrieval
const memoryAuditLog = [];
const MAX_MEMORY_LOGS = 200;

export const AuditEventType = {
  AUTH_LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILURE: 'AUTH_LOGIN_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  ACCESS_DENIED: 'ACCESS_DENIED',
  RATE_LIMIT_HIT: 'RATE_LIMIT_HIT',
  CSRF_VIOLATION: 'CSRF_VIOLATION',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  TEAM_MODIFIED: 'TEAM_MODIFIED',
  SERVICE_MODIFIED: 'SERVICE_MODIFIED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  INQUIRY_RECEIVED: 'INQUIRY_RECEIVED',
  INQUIRY_DELETED: 'INQUIRY_DELETED',
  VERIFICATION_ATTEMPT: 'VERIFICATION_ATTEMPT',
  SSRF_ATTEMPT_BLOCKED: 'SSRF_ATTEMPT_BLOCKED',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION'
};

/**
 * Records an audit log event to both memory buffer and Firestore collection
 * 
 * @param {object} event
 * @param {string} event.eventType - One of AuditEventType
 * @param {string} [event.actor='anonymous'] - User ID, email, or IP
 * @param {string} [event.ip='unknown'] - Client IP address
 * @param {string} [event.userAgent='unknown'] - Client User Agent
 * @param {string} [event.status='SUCCESS'] - SUCCESS or FAILURE
 * @param {object} [event.details={}] - Non-sensitive metadata
 */
export async function logAuditEvent({
  eventType,
  actor = 'anonymous',
  ip = 'unknown',
  userAgent = 'unknown',
  status = 'SUCCESS',
  details = {}
}) {
  const logEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    eventType,
    actor,
    ip,
    userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 150) : 'unknown',
    status,
    details,
    timestamp: new Date().toISOString()
  };

  // Add to memory ring buffer
  memoryAuditLog.unshift(logEntry);
  if (memoryAuditLog.length > MAX_MEMORY_LOGS) {
    memoryAuditLog.pop();
  }

  // Safe console log for log stream
  safeLogger.info(`[AUDIT] [${logEntry.status}] [${logEntry.eventType}] Actor: ${logEntry.actor} | IP: ${logEntry.ip}`);

  // Persist asynchronously in Firestore
  try {
    await auditDb.create(logEntry);
  } catch (err) {
    // Audit logging failure should not crash main request, but must be noted
    safeLogger.warn('[Audit Log Persistence Warning] Could not store audit entry in Firestore:', err.message);
  }

  return logEntry;
}

/**
 * Retrieves the most recent audit logs for administrative monitoring
 * @param {number} [limit=50]
 * @returns {Promise<Array>}
 */
export async function getAuditLogs(limit = 50) {
  try {
    const logs = await auditDb.getAll();
    if (logs && logs.length > 0) {
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return logs.slice(0, limit);
    }
  } catch (err) {
    safeLogger.warn('Falling back to memory audit logs:', err.message);
  }

  return memoryAuditLog.slice(0, limit);
}
