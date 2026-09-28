import { Router } from 'express';
import {
  submitContactForm,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry
} from '../controllers/contactController.js';
import { validateContactInput } from '../validators/contactValidator.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public submission with rate limiting and input validation
router.post('/', contactLimiter, validateContactInput, submitContactForm);

// Protected admin inquiry management
router.get('/', requireAdmin, getAllInquiries);
router.patch('/:id', requireAdmin, updateInquiryStatus);
router.delete('/:id', requireAdmin, deleteInquiry);

export default router;
