import { Router } from 'express';
import {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
  validateProjectInput,
  validateProjectIdParam,
  validateProjectSlugParam
} from '../validators/projectValidator.js';

const router = Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:slug', validateProjectSlugParam, getProjectBySlug);

// Protected admin routes
router.post('/', requireAdmin, validateProjectInput, createProject);
router.put('/:id', requireAdmin, validateProjectIdParam, validateProjectInput, updateProject);
router.delete('/:id', requireAdmin, validateProjectIdParam, deleteProject);

export default router;
