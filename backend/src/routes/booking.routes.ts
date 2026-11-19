import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public / Customer
router.get('/available-times', BookingController.getAvailableTimes);
router.post('/', BookingController.createBooking);
router.get('/my-bookings', BookingController.getCustomerBookings);
router.post('/:id/cancel', BookingController.cancelCustomerBooking);

// Admin Protected
router.get('/admin/all', authenticateAdmin, BookingController.adminGetAllBookings);
router.get('/admin/calendar', authenticateAdmin, BookingController.adminGetCalendarEvents);
router.patch('/admin/:id/status', authenticateAdmin, BookingController.adminUpdateBookingStatus);
router.put('/admin/:id', authenticateAdmin, BookingController.adminEditBooking);
router.delete('/admin/:id', authenticateAdmin, BookingController.adminDeleteBooking);

export default router;
