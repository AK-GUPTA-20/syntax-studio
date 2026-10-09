import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Secure fallback generator for development only
function getSecureDevSecret(envVarName) {
  if (isProduction) {
    throw new Error(
      `[SECURITY FATAL] Missing required environment variable '${envVarName}' in production mode! Server startup aborted.`
    );
  }
  const ephemeralKey = crypto.randomBytes(32).toString('hex');
  console.warn(
    `⚠️ [SECURITY NOTICE] '${envVarName}' is not defined. Using temporary ephemeral cryptographic key for development.`
  );
  return ephemeralKey;
}

const adminSecretKey = process.env.ADMIN_SECRET_KEY || getSecureDevSecret('ADMIN_SECRET_KEY');
const jwtSecret = process.env.JWT_SECRET || adminSecretKey;

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  adminSecretKey,
  jwtSecret,
  // Admin credentials: prefer pre-hashed bcrypt password, or plaintext password from env
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  adminPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_ACCESS_TOKEN || '',
  webhookSecret: process.env.WEBHOOK_SECRET || adminSecretKey,
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
