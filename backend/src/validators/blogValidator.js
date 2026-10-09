import { body, param, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateBlogIdParam = [
  param('id')
    .trim()
    .notEmpty().withMessage('Blog post ID is required')
    .matches(/^[a-zA-Z0-9_-]{1,128}$/).withMessage('Invalid blog post ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateBlogSlugParam = [
  param('slug')
    .trim()
    .notEmpty().withMessage('Blog slug is required')
    .matches(/^[a-z0-9_-]{2,100}$/).withMessage('Invalid blog slug format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Invalid parameter', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];

export const validateBlogPostInput = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9_-]{2,100}$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Excerpt cannot exceed 500 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 20, max: 50000 }).withMessage('Content must be between 20 and 50,000 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Author name cannot exceed 100 characters'),
  body('coverImage')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Cover image URL cannot exceed 1,000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 20 }).withMessage('Tags must be an array of at most 20 items'),
  body('tags.*')
    .optional()
    .isString().trim().isLength({ max: 50 }).withMessage('Tag cannot exceed 50 characters'),
  body('published')
    .optional()
    .isBoolean().withMessage('Published must be a boolean value'),
  body('readTime')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Read time cannot exceed 50 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
