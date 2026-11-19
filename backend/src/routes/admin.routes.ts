import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateAdmin);

router.get('/dashboard-stats', AdminController.getDashboardStats);
router.get('/clients', AdminController.getAllClients);
router.get('/clients/:id', AdminController.getClientDetails);

export default router;
