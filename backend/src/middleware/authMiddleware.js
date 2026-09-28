import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getAdminAuth } from '../firebase/firebaseAdmin.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Unauthorized: No token provided', null, 401);
    }

    const token = authHeader.split('Bearer ')[1].trim();

    // Check direct secret admin token
    if (token === config.adminAccessToken || token === config.adminSecretKey) {
      req.adminUser = { role: 'admin', uid: 'admin_local' };
      return next();
    }

    // Verify with Firebase Admin Auth
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.adminUser = decodedToken;
    return next();
  } catch (error) {
    return ApiResponse.error(res, 'Forbidden: Invalid or expired admin credentials', error.message, 403);
  }
};
