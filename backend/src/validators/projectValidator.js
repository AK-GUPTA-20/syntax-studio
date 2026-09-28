import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateProjectInput = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
  body('overview').optional().trim(),
  body('author').optional().trim(),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
