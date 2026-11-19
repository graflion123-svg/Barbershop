import { Router } from 'express';
import { BarberController } from '../controllers/barber.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', BarberController.getAllActiveBarbers);
router.get('/:id', BarberController.getBarberById);

// Admin Protected
router.get('/admin/all', authenticateAdmin, BarberController.adminGetAllBarbers);
router.post('/admin', authenticateAdmin, BarberController.adminCreateBarber);
router.put('/admin/:id', authenticateAdmin, BarberController.adminUpdateBarber);
router.delete('/admin/:id', authenticateAdmin, BarberController.adminDeleteBarber);
router.put('/admin/:id/schedule', authenticateAdmin, BarberController.adminUpdateSchedule);
router.post('/admin/:id/day-off', authenticateAdmin, BarberController.adminAddDayOff);
router.delete('/admin/:id/day-off/:dayOffId', authenticateAdmin, BarberController.adminRemoveDayOff);

export default router;
