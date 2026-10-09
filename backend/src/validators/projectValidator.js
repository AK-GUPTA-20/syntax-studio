import { body, param, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateProjectIdParam = [
  param('id')
    .trim()
    .notEmpty().withMessage('Project ID is required')
    .matches(/^[a-zA-Z0-9_-]{1,128}$/).withMessage('Invalid project ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateProjectSlugParam = [
  param('slug')
    .trim()
    .notEmpty().withMessage('Project slug is required')
    .matches(/^[a-zA-Z0-9_-]{1,128}$/).withMessage('Invalid project slug format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateProjectInput = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ min: 2, max: 150 }).withMessage('Title must be between 2 and 150 characters'),
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9_-]{2,100}$/).withMessage('Slug must be 2-100 characters and contain only lowercase letters, numbers, hyphens, and underscores'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters'),
  body('shortDescription')
    .trim()
    .notEmpty().withMessage('Short description is required')
    .isLength({ min: 5, max: 500 }).withMessage('Short description must be between 5 and 500 characters'),
  body('overview')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Overview cannot exceed 10,000 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Author cannot exceed 100 characters'),
  body('technologies')
    .optional()
    .isArray({ max: 50 }).withMessage('Technologies must be an array of at most 50 items'),
  body('technologies.*')
    .optional()
    .isString().trim().isLength({ max: 50 }).withMessage('Technology tag cannot exceed 50 characters'),
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean'),
  body('client')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Client name cannot exceed 150 characters'),
  body('link')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Link URL cannot exceed 500 characters'),
  body('github')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('GitHub URL cannot exceed 500 characters'),
  body('thumbnail')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Thumbnail URL cannot exceed 1000 characters'),
  body('images')
    .optional()
    .isArray({ max: 20 }).withMessage('Images must be an array with at most 20 URLs'),
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
