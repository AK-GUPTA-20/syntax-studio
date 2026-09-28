import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', requireAdmin, createService);
router.put('/:id', requireAdmin, updateService);
router.delete('/:id', requireAdmin, deleteService);

export default router;
