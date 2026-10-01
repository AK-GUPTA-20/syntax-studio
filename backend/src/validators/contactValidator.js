import { body, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateContactInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Company name cannot exceed 120 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      const cleaned = val.replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91|0)/, '');
      if (!/^[6-9]\d{9}$/.test(cleaned)) {
        throw new Error('Please provide a valid 10-digit Indian mobile number (e.g. +91 9876543210)');
      }
      return true;
    }),
  body('projectType')
    .optional()
    .trim(),
  body('budget')
    .optional()
    .trim(),
  body('timeline')
    .optional()
    .trim(),
  body('message')
    .trim()
    .notEmpty().withMessage('Project details / message is required')
    .isLength({ min: 10, max: 3000 }).withMessage('Message must be between 10 and 3000 characters'),
  body('firebaseToken')
    .optional({ checkFalsy: true })
    .trim(),
  body('emailVerificationProof')
    .optional({ checkFalsy: true })
    .trim(),
  body().custom((reqBody) => {
    const hasFirebase = Boolean(reqBody.firebaseToken && reqBody.firebaseToken.trim());
    const hasEmailProof = Boolean(reqBody.emailVerificationProof && reqBody.emailVerificationProof.trim());
    if (!hasFirebase && !hasEmailProof) {
      throw new Error('Verification required: Please verify your Work Email via Resend or your Indian Mobile Number via Phone OTP');
    }
    return true;
  }),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Promo code cannot exceed 50 characters'),
  body('promoCode')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('termsAccepted')
    .optional()
    .isBoolean().withMessage('Terms acceptance must be a boolean value'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ApiResponse.error(res, 'Validation failed', errors.array().map(e => e.msg).join(', '), 400);
    }
    next();
  }
];
