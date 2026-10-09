import { body, param, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateServiceIdParam = [
  param('id')
    .trim()
    .notEmpty().withMessage('Service ID is required')
    .matches(/^[a-zA-Z0-9_-]{1,128}$/).withMessage('Invalid service ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateServiceInput = [
  body('title')
    .trim()
    .notEmpty().withMessage('Service title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Title must be between 2 and 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 5, max: 3000 }).withMessage('Description must be between 5 and 3,000 characters'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Icon identifier cannot exceed 200 characters'),
  body('features')
    .optional()
    .isArray({ max: 50 }).withMessage('Features must be an array of at most 50 items'),
  body('features.*')
    .optional()
    .isString().trim().isLength({ max: 200 }).withMessage('Feature text cannot exceed 200 characters'),
  body('order')
    .optional()
    .isInt({ min: 0, max: 10000 }).withMessage('Order must be an integer between 0 and 10,000'),
  body('enabled')
    .optional()
    .isBoolean().withMessage('Enabled must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
