import { Router } from 'express';
import { adminLogin, verifyAdmin, fetchAuditLogs } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateAdminLogin } from '../validators/authValidator.js';

const router = Router();

// Rate-limited & validated admin login
router.post('/login', authLimiter, validateAdminLogin, adminLogin);

// Token verification
router.get('/verify', requireAdmin, verifyAdmin);

// Centralized audit logs for admin inspection
router.get('/audit-logs', requireAdmin, fetchAuditLogs);

export default router;
