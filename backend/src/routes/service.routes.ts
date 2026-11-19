import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', ServiceController.getAllActiveServices);

// Admin Protected
router.get('/admin/all', authenticateAdmin, ServiceController.adminGetAllServices);
router.post('/admin', authenticateAdmin, ServiceController.adminCreateService);
router.put('/admin/:id', authenticateAdmin, ServiceController.adminUpdateService);
router.delete('/admin/:id', authenticateAdmin, ServiceController.adminDeleteService);

export default router;
