import Order from '../models/Order.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';

// @desc    Create a new order from Customer Checkout
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        console.log("Receiving order payload:", JSON.stringify(req.body, null, 2));
        const {
            customerInfo,
            orderItems,
            totalAmount,
            orderType,
            paymentMethod,
            paymentStatus,
            userId,
            staffId,
            deviceUUID,
            discount,
            tax,
            subTotal
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Validate 10-digit phone number for delivery orders
        const phoneRaw = customerInfo?.phone || '';
        const phoneDigits = phoneRaw.replace(/\D/g, '');
        if (orderType === 'delivery' && phoneDigits.length !== 10) {
            return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits long.' });
        }

        // Default customer info if missing (especially for POS)
        const finalCustomerInfo = {
            name: customerInfo?.name || 'Walk-in Customer',
            phone: customerInfo?.phone || '0000000000',
            address: customerInfo?.address || '',
            email: customerInfo?.email || ''
        };

        const order = new Order({
            user: (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null,
            staffId: (staffId && mongoose.Types.ObjectId.isValid(staffId)) ? staffId : null,
            deviceUUID: deviceUUID || null,
            customerInfo: finalCustomerInfo,
            orderItems,
            discount: Number(discount) || 0,
            tax: Number(tax) || 0,
            subTotal: Number(subTotal) || Number(totalAmount),
            totalAmount: Number(totalAmount),
            orderType: orderType || 'delivery',
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: (paymentMethod === 'online' || paymentStatus === 'paid') ? 'paid' : 'pending',
            status: orderType === 'pos' ? 'delivered' : 'pending'
        });

        const createdOrder = await order.save();

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            await User.findByIdAndUpdate(userId, { hasUsedWelcomeOffer: true });
        }

        console.log("Order saved successfully:", createdOrder._id);
        res.status(201).json({ success: true, data: createdOrder });
    } catch (error) {
        console.error("CRITICAL ERROR: Order creation failed!");
        console.error(error);
        res.status(500).json({
            success: false,
            message: `Server Error: ${error.message}`
        });
    }
};

// @desc    Get all orders for Admin Panel Dashboards and order tracking
// @route   GET /api/orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }); // Newest first
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching orders.' });
    }
};

// @desc    Get all orders by customer phone number or device ID (No auth required)
// @route   GET /api/orders/by-phone/:phoneOrDevice
export const getOrdersByPhone = async (req, res) => {
    try {
        const { phone } = req.params; // we keep parameter name 'phone' to avoid changing frontend route, but it can be deviceUUID
        
        let query;
        if (phone.length === 10 && !isNaN(phone)) {
            // It's likely a phone number, but could also be a short deviceId. We'll search both robustly
            query = { $or: [{ 'customerInfo.phone': phone }, { deviceUUID: phone }] };
        } else {
            // Unlikely to be a phone, definitely a deviceUUID
            query = { deviceUUID: phone };
        }
        
        const orders = await Order.find(query).sort({ createdAt: -1 });
        
        // Don't 404, just return empty array so frontend is happy
        res.status(200).json({ success: true, count: orders.length, orders: orders || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error retrieving orders.', error: error.message });
    }
};

// @desc    Update Order Status (For Admin / Kitchen Panel)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

// @desc    Get single order by ID (Supports full and partial/short IDs)
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        let order = null;

        // 1. Try exact match if ID looks like a valid 24-char ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id);
        }

        // 2. Fallback: Search for any order whose _id ends with the input (case-insensitive)
        if (!order) {
            // We fetch all recent orders and filter by string - safer than complex regex on _id
            const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(100);
            order = recentOrders.find(o => 
                o._id.toString().toUpperCase().endsWith(id.toUpperCase())
            );
        }

        if (order) {
            res.json({ success: true, data: order });
        } else {
            res.status(404).json({ success: false, message: 'Order ID not found.' });
        }
    } catch (error) {
        console.error("Tracking error:", error);
        res.status(500).json({ success: false, message: 'Error retrieving order status.' });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay/create
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ success: false, message: 'Razorpay keys not configured in backend' });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).json({ success: false, message: 'Failed to create razorpay order' });

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Razorpay order creation failed", error);
        res.status(500).json({ success: false, message: 'Server error while creating Razorpay order' });
    }
};

// @desc    Verify Razorpay Payment and Create Order
// @route   POST /api/orders/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData // The actual order data to save in DB
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const {
                customerInfo,
                orderItems,
                totalAmount,
                orderType,
                paymentMethod,
                userId,
                deviceUUID,
                discount,
                tax,
                subTotal
            } = orderData;

            // Validate 10-digit phone number for delivery orders
            const phoneRaw = customerInfo?.phone || '';
            const phoneDigits = phoneRaw.replace(/\D/g, '');
            if (orderType === 'delivery' && phoneDigits.length !== 10) {
                return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits long.' });
            }

            const newOrder = new Order({
                user: (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null,
                deviceUUID: deviceUUID || null,
                customerInfo: customerInfo || { name: 'Walk-in Customer', phone: '0000000000' },
                orderItems,
                discount: discount || 0,
                tax: tax || 0,
                subTotal: subTotal || totalAmount,
                totalAmount,
                orderType: orderType || 'delivery',
                paymentMethod: paymentMethod || 'online',
                paymentStatus: 'paid',
                status: 'pending',
                transactionId: razorpay_payment_id
            });

            const savedOrder = await newOrder.save();

            // Mark user as having used the welcome offer if logged in
            if (userId) {
                await User.findByIdAndUpdate(userId, { hasUsedWelcomeOffer: true });
            }

            res.status(200).json({ success: true, message: 'Payment verified successfully', data: savedOrder });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error("Payment verification error", error);
        res.status(500).json({ success: false, message: 'Server error during payment verification' });
    }
};

// @desc    Get Razorpay Key ID for Frontend
// @route   GET /api/orders/razorpay/key
export const getRazorpayKey = (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID || '' });
};
