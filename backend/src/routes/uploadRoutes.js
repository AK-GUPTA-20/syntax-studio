import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protected admin upload route
router.post('/', requireAdmin, uploadImage);

export default router;
