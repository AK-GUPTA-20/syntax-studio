import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateAdminLogin = [
  body('password')
    .isString().withMessage('Password must be a string')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
  body('mfaCode')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('MFA code must be exactly 6 digits'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
