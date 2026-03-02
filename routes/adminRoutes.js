import express from 'express';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({});
        const totalUsers = await User.countDocuments({ role: 'customer' });

        // Delivered (Complete) Orders
        const completeOrders = await Order.countDocuments({ status: 'delivered' });

        // Cancelled Orders
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        // Total Revenue from Delivered Orders
        const orders = await Order.find({ status: 'delivered' });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Popular Items Aggregation
        const itemCounts = {};
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (!itemCounts[item.name]) itemCounts[item.name] = 0;
                itemCounts[item.name] += item.quantity;
            });
        });

        // Sort items by highest sold count and grab top 3
        const popularItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => ({ name: entry[0], sold: entry[1] }));

        // Active Coupons
        const activeCoupons = await Coupon.countDocuments({ isActive: true });

        // Staff-wise stats (POS only or all)
        const staffOrders = await Order.find({ staffId: { $ne: null } }).populate('staffId', 'name email');
        const staffStats = {};

        staffOrders.forEach(o => {
            const sid = o.staffId._id.toString();
            if (!staffStats[sid]) {
                staffStats[sid] = {
                    name: o.staffId.name || o.staffId.email.split('@')[0],
                    revenue: 0,
                    orderCount: 0
                };
            }
            if (o.status === 'delivered') {
                staffStats[sid].revenue += o.totalAmount;
            }
            staffStats[sid].orderCount += 1;
        });

        const staffSummary = Object.values(staffStats);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalUsers,
                completeOrders,
                cancelledOrders,
                totalRevenue,
                activeCoupons,
                popularItems,
                staffSummary
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});

// @desc    Get all coupons
// @route   GET /api/admin/coupons
router.get('/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving coupons' });
    }
});

// @desc    Create a new coupon
// @route   POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
        }
        res.status(400).json({ success: false, message: 'Error creating coupon', error: error.message });
    }
});

// @desc    Update a coupon
// @route   PUT /api/admin/coupons/:id
router.put('/coupons/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating coupon' });
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting coupon' });
    }
});

// @desc    Validate a coupon code (For Checkout UI Frontend)
// @route   POST /api/admin/coupons/validate
router.post('/coupons/validate', async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
        }

        if (orderTotal < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon` });
        }

        let discount = 0;
        if (coupon.discountType === 'AMOUNT') {
            discount = coupon.discountValue;
        } else if (coupon.discountType === 'PERCENT') {
            discount = (orderTotal * coupon.discountValue) / 100;
        }

        res.status(200).json({ success: true, discount, message: 'Coupon Applied!' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error validating coupon' });
    }
});

// @desc    Get all settings
// @route   GET /api/admin/settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await Setting.find({});
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving settings' });
    }
});

// @desc    Get a single setting by key
// @route   GET /api/admin/settings/:key
router.get('/settings/:key', async (req, res) => {
    try {
        let setting = await Setting.findOne({ key: req.params.key });
        // Default values if not exists
        if (!setting && req.params.key === 'new_user_discount') {
            setting = { key: 'new_user_discount', value: 20 };
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving setting' });
    }
});

// @desc    Update or Create a setting
// @route   PUT /api/admin/settings/:key
router.put('/settings/:key', protect, admin, async (req, res) => {
    try {
        const { value, description } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key: req.params.key },
            { value, description },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating setting' });
    }
});

export default router;
