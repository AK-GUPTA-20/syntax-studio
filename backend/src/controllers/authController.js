import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const adminLogin = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return ApiResponse.error(res, 'Password is required', null, 400);
    }

    if (password === config.adminAccessToken || password === config.adminSecretKey) {
      return ApiResponse.success(res, 'Authentication successful', {
        token: config.adminAccessToken,
        role: 'admin',
        user: { name: 'Agency Administrator', email: 'admin@syntaxstudio.dev' }
      });
    }

    return ApiResponse.error(res, 'Invalid credentials. Access denied.', null, 401);
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
