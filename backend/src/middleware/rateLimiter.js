import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent, AuditEventType } from '../services/auditLogger.js';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_HIT,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { path: req.originalUrl, limiter: 'globalLimiter' }
    });
    return ApiResponse.error(res, 'Too many requests from this IP, please try again after 15 minutes.', null, 429);
  }
});

// Strict rate limit on authentication endpoints to prevent brute-force & credential stuffing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // 5 attempts per IP per 15 min in prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_HIT,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { path: req.originalUrl, limiter: 'authLimiter' }
    });
    return ApiResponse.error(
      res,
      'Too many failed login attempts. Account access is temporarily locked. Try again in 15 minutes.',
      null,
      429
    );
  }
});

// Rate limit for contact inquiries
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 100 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_HIT,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { path: req.originalUrl, limiter: 'contactLimiter' }
    });
    return ApiResponse.error(
      res,
      'Contact form rate limit exceeded. Please try again later or reach out directly by email.',
      null,
      429
    );
  }
});

// Rate limit for verification OTP requests
export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_HIT,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { path: req.originalUrl, limiter: 'verificationLimiter' }
    });
    return ApiResponse.error(
      res,
      'Too many verification attempts from this IP. Please try again after 15 minutes.',
      null,
      429
    );
  }
});

// Rate limit for media and file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_HIT,
      actor: req.ip,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'BLOCKED',
      details: { path: req.originalUrl, limiter: 'uploadLimiter' }
    });
    return ApiResponse.error(
      res,
      'Upload rate limit exceeded. Please wait a few minutes before uploading additional assets.',
      null,
      429
    );
  }
});
