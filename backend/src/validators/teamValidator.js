import { body, param, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateTeamIdParam = [
  param('id')
    .trim()
    .notEmpty().withMessage('Team member ID is required')
    .matches(/^[a-zA-Z0-9_-]{1,128}$/).withMessage('Invalid team member ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateTeamInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Member name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9_-]{2,100}$/).withMessage('Slug must be 2-100 characters and contain only lowercase letters, numbers, hyphens, and underscores'),
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isLength({ min: 2, max: 100 }).withMessage('Role must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Bio cannot exceed 3,000 characters'),
  body('avatar')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Avatar URL cannot exceed 1,000 characters'),
  body('skills')
    .optional()
    .isArray({ max: 50 }).withMessage('Skills must be an array of at most 50 items'),
  body('order')
    .optional()
    .isInt({ min: 0, max: 10000 }).withMessage('Order must be an integer between 0 and 10,000'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
