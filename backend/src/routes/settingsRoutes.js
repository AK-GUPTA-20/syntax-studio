import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validateSettingsInput } from '../validators/settingsValidator.js';

const router = Router();

router.get('/', getSettings);
router.put('/', requireAdmin, validateSettingsInput, updateSettings);

export default router;
