import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Create a new order from Customer Checkout
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        const {
            customerInfo,
            orderItems,
            totalAmount,
            orderType,
            paymentMethod,
            paymentStatus,
            userId, // optional
            staffId, // optional for POS
            discount,
            tax,
            subTotal
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        } else {
            // Default customer info if missing in POS
            const finalCustomerInfo = customerInfo || { name: 'Walk-in Customer', phone: '0000000000' };

            const order = new Order({
                user: userId || null,
                staffId: staffId || null,
                customerInfo: finalCustomerInfo,
                orderItems,
                discount: discount || 0,
                tax: tax || 0,
                subTotal: subTotal || totalAmount,
                totalAmount,
                orderType, // e.g., 'delivery' or 'pos'
                paymentMethod,
                paymentStatus: paymentStatus || 'paid', // POS is mostly paid immediately
                status: orderType === 'pos' ? 'delivered' : 'pending' // POS orders instantly delivered or prepared
            });

            const createdOrder = await order.save();

            // Mark user as having used the welcome offer if logged in
            if (userId) {
                await User.findByIdAndUpdate(userId, { hasUsedWelcomeOffer: true });
            }

            res.status(201).json({ success: true, data: createdOrder });
        }
    } catch (error) {
        console.error("Order creation failed", error);
        res.status(500).json({ success: false, message: 'Server error while creating order' });
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
