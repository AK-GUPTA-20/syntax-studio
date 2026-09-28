import { Router } from 'express';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllTestimonials);
router.post('/', requireAdmin, createTestimonial);
router.put('/:id', requireAdmin, updateTestimonial);
router.delete('/:id', requireAdmin, deleteTestimonial);

export default router;
