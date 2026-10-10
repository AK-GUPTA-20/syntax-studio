import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate strictly required security environment variables (Non-optional)
function validateRequiredConfig() {
  const missing = [];

  const adminSecretKey = (process.env.ADMIN_SECRET_KEY || '').trim();
  if (!adminSecretKey) {
    missing.push('ADMIN_SECRET_KEY is required in your backend .env file.');
  } else if (adminSecretKey.length < 32) {
    missing.push(`ADMIN_SECRET_KEY must be at least 32 characters long (currently ${adminSecretKey.length} chars).`);
  }

  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    missing.push('JWT_SECRET is required in your backend .env file for cryptographically signing admin tokens.');
  } else if (jwtSecret.length < 32) {
    missing.push(`JWT_SECRET must be at least 32 characters long (currently ${jwtSecret.length} chars).`);
  }

  const webhookSecret = (process.env.WEBHOOK_SECRET || '').trim();
  if (!webhookSecret) {
    missing.push('WEBHOOK_SECRET is required in your backend .env file for HMAC-SHA256 signature verification.');
  } else if (webhookSecret.length < 32) {
    missing.push(`WEBHOOK_SECRET must be at least 32 characters long (currently ${webhookSecret.length} chars).`);
  }

  const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  const isBcrypt = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(adminPasswordHash);
  if (!adminPasswordHash) {
    missing.push('ADMIN_PASSWORD_HASH is required in your backend .env file (must be a valid bcrypt hash).');
  } else if (!isBcrypt) {
    missing.push('ADMIN_PASSWORD_HASH must be a valid bcrypt hash format (e.g. $2b$12$...).');
  }

  if (missing.length > 0) {
    const errorBox = [
      '',
      '================================================================================',
      '🚨 [CONFIG FATAL ERROR] Required Security Environment Variables Missing/Invalid',
      '================================================================================',
      ...missing.map((m) => `  • ${m}`),
      '',
      '  These variables are strictly required and cannot be omitted.',
      '  Please verify your backend/.env matches backend/.env.example.',
      '================================================================================',
      '',
    ].join('\n');
    throw new Error(errorBox);
  }
}

validateRequiredConfig();

const adminSecretKey = process.env.ADMIN_SECRET_KEY.trim();
const jwtSecret = process.env.JWT_SECRET.trim();
const webhookSecret = process.env.WEBHOOK_SECRET.trim();
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH.trim();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  adminSecretKey,
  jwtSecret,
  adminPasswordHash,
  adminPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_ACCESS_TOKEN || '',
  webhookSecret,
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  promoCode: process.env.PROMO_CODE || 'syntaxStudio',
  discountPercentage: parseInt(process.env.DISCOUNT_PERCENT, 10) || 10,
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  resend: {
    apiKey: (process.env.RESEND_API_KEY || '').trim(),
    fromEmail: (process.env.RESEND_FROM_EMAIL || 'Support Studio <noreply@support-studio.work.gd>').trim(),
  },
};
