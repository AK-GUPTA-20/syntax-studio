import crypto from 'crypto';
import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateAdminJwt } from '../utils/jwtSecurity.js';
import { comparePassword, isBcryptHash } from '../utils/passwordSecurity.js';
import { logAuditEvent, getAuditLogs, AuditEventType } from '../services/auditLogger.js';

// Constant-time string equality helper
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return ApiResponse.error(res, 'Password is required', null, 400);
    }

    let isAuthenticated = false;

    // 1. Check against bcrypt hash if configured
    if (config.adminPasswordHash && isBcryptHash(config.adminPasswordHash)) {
      isAuthenticated = await comparePassword(password, config.adminPasswordHash);
    } else if (config.adminPassword) {
      // 2. Safe constant-time comparison against configured password
      isAuthenticated = safeCompare(password, config.adminPassword);
    } else if (config.adminSecretKey) {
      // 3. Fallback to secret key
      isAuthenticated = safeCompare(password, config.adminSecretKey);
    }

    if (!isAuthenticated) {
      await logAuditEvent({
        eventType: AuditEventType.AUTH_LOGIN_FAILURE,
        actor: req.ip,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'FAILURE',
        details: { reason: 'Incorrect credentials' }
      });
      return ApiResponse.error(res, 'Invalid credentials. Access denied.', null, 401);
    }

    // Generate secure signed JWT
    const adminUser = {
      uid: 'admin_primary',
      email: 'admin@syntaxstudio.dev',
      name: 'Agency Administrator'
    };
    const token = generateAdminJwt(adminUser, '2h');

    await logAuditEvent({
      eventType: AuditEventType.AUTH_LOGIN_SUCCESS,
      actor: adminUser.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { role: 'admin' }
    });

    return ApiResponse.success(res, 'Authentication successful', {
      token,
      expiresIn: '2h',
      role: 'admin',
      user: adminUser
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAdmin = async (req, res) => {
  return ApiResponse.success(res, 'Token is valid', {
    user: req.adminUser,
    authenticated: true
  });
};

export const fetchAuditLogs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const logs = await getAuditLogs(limit);
    return ApiResponse.success(res, 'Audit logs retrieved', logs);
  } catch (error) {
    next(error);
  }
};
