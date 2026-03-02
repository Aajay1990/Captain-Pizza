import express from 'express';
import { register, login, verifyEmail, getAllUsers, sendOtp, verifyOtp, deleteUser, resendVerificationCode, forgotPassword, resetPassword, testEmail, updateUserPassword, adminGuestLogin } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/password', protect, admin, updateUserPassword);
router.post('/admin-pos-access', protect, admin, adminGuestLogin);

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Diagnostic test (public so user can check anytime via URL/Postman)
router.post('/test-email', testEmail);

export default router;
