import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Get user profile (Addresses, Wallet)
// @route   GET /api/users/:id/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Also fetch user's last orders
        const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

        res.json({ success: true, data: user, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add/Update user address
// @route   PUT /api/users/:id/address
export const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { label, street, city, pinCode } = req.body;

        // Adding a new address to the array
        user.addresses.push({ label, street, city, pinCode });
        await user.save();

        res.json({ success: true, message: 'Address Added Successfully', data: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding address' });
    }
};

// @desc    Recharge Wallet (Simulated)
// @route   POST /api/users/:id/wallet
export const rechargeWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.walletBalance += Number(amount);
        await user.save();

        res.json({ success: true, message: `Successfully recharged ₹${amount}`, walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error recharging wallet' });
    }
};
