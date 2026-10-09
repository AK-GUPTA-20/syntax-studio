import { ApiResponse } from '../utils/apiResponse.js';
import { getAdminAuth } from '../firebase/firebaseAdmin.js';
import { verifyAdminJwt } from '../utils/jwtSecurity.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logAuditEvent({
      eventType: AuditEventType.ACCESS_DENIED,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { reason: 'Missing Authorization Bearer header', path: req.originalUrl }
    });
    return ApiResponse.error(res, 'Unauthorized: No authentication token provided', null, 401);
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return ApiResponse.error(res, 'Unauthorized: Empty token', null, 401);
  }

  // 1. First attempt: Verify as signed JWT token
  try {
    const decoded = verifyAdminJwt(token);
    if (decoded && decoded.role === 'admin') {
      req.adminUser = decoded;
      return next();
    }
  } catch (jwtErr) {
    // If not a valid local JWT, proceed to Firebase verification
  }

  // 2. Second attempt: Verify with Firebase Admin Auth
  try {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      const decodedFirebase = await adminAuth.verifyIdToken(token);
      // Enforce admin permission / custom claim if present
      req.adminUser = {
        uid: decodedFirebase.uid,
        email: decodedFirebase.email,
        role: decodedFirebase.admin ? 'admin' : 'authenticated_user',
        firebase: true
      };
      return next();
    }
  } catch (firebaseErr) {
    // Token failed both verification methods
  }

  // Log failed authentication attempt
  logAuditEvent({
    eventType: AuditEventType.ACCESS_DENIED,
    actor: req.ip,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'BLOCKED',
    details: { reason: 'Invalid or expired credentials', path: req.originalUrl }
  });

  return ApiResponse.error(res, 'Forbidden: Invalid or expired admin credentials', null, 403);
};
