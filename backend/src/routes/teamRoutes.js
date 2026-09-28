import { Router } from 'express';
import {
  getAllTeamMembers,
  getTeamMemberBySlug,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/teamController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllTeamMembers);
router.get('/:slug', getTeamMemberBySlug);
router.post('/', requireAdmin, createTeamMember);
router.put('/:id', requireAdmin, updateTeamMember);
router.delete('/:id', requireAdmin, deleteTeamMember);

export default router;
