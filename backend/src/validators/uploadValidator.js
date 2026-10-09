import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateUploadInput = [
  body('file')
    .notEmpty().withMessage('File data is required')
    .isString().withMessage('File data must be a string (base64 or data URL)'),
  body('fileName')
    .optional()
    .isString().trim()
    .isLength({ max: 200 }).withMessage('File name cannot exceed 200 characters'),
  body('folder')
    .optional()
    .isString().trim()
    .matches(/^\/[a-zA-Z0-9_\-\/]{0,100}$/).withMessage('Folder must be a valid path without directory traversal'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
