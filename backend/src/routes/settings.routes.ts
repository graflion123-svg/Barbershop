import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', SettingsController.getSettings);

// Admin Protected
router.put('/', authenticateAdmin, SettingsController.adminUpdateSettings);

export default router;
