import { Router } from 'express';
import {
  getAllTeamMembers,
  getTeamMemberBySlug,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/teamController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
  validateTeamInput,
  validateTeamIdParam
} from '../validators/teamValidator.js';

const router = Router();

router.get('/', getAllTeamMembers);
router.get('/:slug', getTeamMemberBySlug);

router.post('/', requireAdmin, validateTeamInput, createTeamMember);
router.put('/:id', requireAdmin, validateTeamIdParam, validateTeamInput, updateTeamMember);
router.delete('/:id', requireAdmin, validateTeamIdParam, deleteTeamMember);

export default router;
