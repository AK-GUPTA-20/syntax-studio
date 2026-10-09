import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateSettingsInput = [
  body('studioName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Studio name must be between 2 and 100 characters'),
  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Contact email must be a valid email format')
    .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),
  body('workingHours')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Working hours cannot exceed 150 characters'),
  body('promoCode')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]{0,50}$/).withMessage('Promo code can only contain alphanumeric characters, hyphens, and underscores (max 50 chars)'),
  body('discountPercentage')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Discount percentage must be an integer between 0 and 100'),
  body('discountLabel')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Discount label cannot exceed 100 characters'),
  body('promoActive')
    .optional()
    .isBoolean().withMessage('Promo active must be a boolean'),
  body('termsAndConditions')
    .optional()
    .isString().withMessage('Terms and conditions must be text')
    .isLength({ max: 50000 }).withMessage('Terms and conditions cannot exceed 50,000 characters'),
  body('termsVersion')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Terms version cannot exceed 20 characters'),
  body('termsLastUpdated')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Terms last updated cannot exceed 50 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
