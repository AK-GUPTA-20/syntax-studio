import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
  validateServiceInput,
  validateServiceIdParam
} from '../validators/serviceValidator.js';

const router = Router();

router.get('/', getAllServices);
router.get('/:id', validateServiceIdParam, getServiceById);

router.post('/', requireAdmin, validateServiceInput, createService);
router.put('/:id', requireAdmin, validateServiceIdParam, validateServiceInput, updateService);
router.delete('/:id', requireAdmin, validateServiceIdParam, deleteService);

export default router;
