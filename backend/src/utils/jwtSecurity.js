import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const JWT_ISSUER = 'syntax-studio-backend';
const JWT_AUDIENCE = 'syntax-studio-admin';
const DEFAULT_EXPIRATION = '2h';

/**
 * Signs a secure JSON Web Token for an authenticated admin
 * @param {object} payload - Admin identity data
 * @param {string} [expiresIn='2h'] - Expiration timeframe
 * @returns {string} - Signed JWT
 */
export function generateAdminJwt(payload, expiresIn = DEFAULT_EXPIRATION) {
  const secret = config.jwtSecret || config.adminSecretKey;
  if (!secret) {
    throw new Error('JWT Secret is not configured.');
  }

  return jwt.sign(
    {
      uid: payload.uid || 'admin',
      role: 'admin',
      email: payload.email || 'admin@syntaxstudio.dev',
      name: payload.name || 'Agency Administrator',
    },
    secret,
    {
      algorithm: 'HS256',
      expiresIn,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}

/**
 * Verifies and decodes a JSON Web Token
 * Enforces algorithm check, expiration, audience, and issuer.
 * @param {string} token - Bearer JWT token
 * @returns {object} - Decoded token payload
 */
export function verifyAdminJwt(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is missing or invalid format');
  }

  const secret = config.jwtSecret || config.adminSecretKey;
  if (!secret) {
    throw new Error('JWT Secret is not configured.');
  }

  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}
