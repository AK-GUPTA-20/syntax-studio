import { Router } from 'express';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
  validateTestimonialInput,
  validateTestimonialIdParam
} from '../validators/testimonialValidator.js';

const router = Router();

router.get('/', getAllTestimonials);
router.post('/', requireAdmin, validateTestimonialInput, createTestimonial);
router.put('/:id', requireAdmin, validateTestimonialIdParam, validateTestimonialInput, updateTestimonial);
router.delete('/:id', requireAdmin, validateTestimonialIdParam, deleteTestimonial);

export default router;
