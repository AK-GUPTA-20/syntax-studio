import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { validateUploadInput } from '../validators/uploadValidator.js';

const router = Router();

// Protected admin upload route with rate limiting and input validation
router.post('/', requireAdmin, uploadLimiter, validateUploadInput, uploadImage);

export default router;
