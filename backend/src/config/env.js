import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'admin_syntax_studio_2025_secure_key',
  adminAccessToken: process.env.ADMIN_ACCESS_TOKEN || 'akshat0021',
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
};
