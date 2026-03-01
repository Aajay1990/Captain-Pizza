import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// Order creation endpoint mapped POST
router.post('/', createOrder);

// Order Retrieval endpoint mapped GET
router.get('/', getOrders);

// Order Status Mutator endpoint mapped PUT
router.put('/:id/status', updateOrderStatus);

export default router;
