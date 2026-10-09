import { body, param, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateTestimonialIdParam = [
  param('id')
    .trim()
    .notEmpty().withMessage('Testimonial ID is required')
    .matches(/^[a-zA-Z0-9_-]{1,128}$/).withMessage('Invalid testimonial ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateTestimonialInput = [
  body('clientName')
    .trim()
    .notEmpty().withMessage('Client name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Client name must be between 2 and 100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Company cannot exceed 120 characters'),
  body('role')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Role cannot exceed 100 characters'),
  body('quote')
    .trim()
    .notEmpty().withMessage('Quote is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Quote must be between 10 and 2,000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('avatar')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Avatar URL cannot exceed 1,000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
