import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';

const router = Router();

// Admin
router.post('/admin/login', AuthController.adminLogin);
router.get('/admin/profile', authenticateAdmin, AuthController.getAdminProfile);

// Customer
router.post('/customer/identify', AuthController.customerIdentify);
router.get('/customer/lookup', AuthController.lookupCustomer);

// SMS OTP Verification
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);

export default router;
