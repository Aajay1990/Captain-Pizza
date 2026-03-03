import express from 'express';
import { createOrder, getOrders, updateOrderStatus, createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey } from '../controllers/orderController.js';

const router = express.Router();

// Razorpay Keys
router.get('/razorpay/key', getRazorpayKey);

// Order creation endpoint mapped POST
router.post('/', createOrder);
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Order Retrieval endpoint mapped GET
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
