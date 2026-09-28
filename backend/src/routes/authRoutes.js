import { Router } from 'express';
import { adminLogin, verifyAdmin } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', adminLogin);
router.get('/verify', requireAdmin, verifyAdmin);

export default router;
