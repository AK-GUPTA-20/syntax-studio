import { Router } from 'express';
import {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validateProjectInput } from '../validators/projectValidator.js';

const router = Router();

router.get('/', getAllProjects);
router.get('/:slug', getProjectBySlug);
router.post('/', requireAdmin, validateProjectInput, createProject);
router.put('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

export default router;
