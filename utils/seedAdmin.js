import User from '../models/User.js';
import Setting from '../models/Setting.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@captainpizza.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                email: adminEmail,
                name: 'Aajay Sharma',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Default Admin created: Aajay Sharma (admin123)');
        } else {
            adminExists.name = 'Aajay Sharma';
            await adminExists.save();
        }

        // --- Seed Default Settings ---
        const defaultSettings = [
            { key: 'seasonal_offer_enabled', value: 'false', description: 'Enable/Disable Home Banner Offer' },
            { key: 'seasonal_offer_title', value: 'Summer Special', description: 'Main heading for home offer' },
            { key: 'seasonal_offer_desc', value: 'Buy 1 Get 1 on Medium Pizzas!', description: 'Main description for home offer' },
            { key: 'seasonal_offer_coupon', value: 'SPECIALBOGO', description: 'Coupon code for seasonal offer' },
            { key: 'seasonal_offer_discount', value: 15, description: 'Discount value for seasonal coupon' },
            { key: 'seasonal_offer_discount_type', value: 'PERCENT', description: 'PERCENT or AMOUNT' },
            { key: 'seasonal_offer_min_order', value: 500, description: 'Min order for seasonal coupon' },
            { key: 'delivery_charge', value: 40, description: 'Flat delivery fee' },
            { key: 'free_delivery_min_order', value: 300, description: 'Order total for free delivery' },
            { key: 'delivery_max_distance_km', value: 3, description: 'Free delivery radius' },
            { key: 'new_user_discount', value: 20, description: 'Percentage for WELCOME coupon' },
            { key: 'show_welcome_popup', value: 'true', description: 'Show welcome popup to new users' }
        ];

        for (const s of defaultSettings) {
            const exists = await Setting.findOne({ key: s.key });
            if (!exists) {
                await Setting.create(s);
                console.log(`✅ Setting [${s.key}] initialized.`);
            }
        }

        const staffEmail = 'staff@captainpizza.com';
        const staffExists = await User.findOne({ email: staffEmail });
        if (!staffExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('staff123', salt);
            await User.create({
                email: staffEmail,
                name: 'POS Staff 01',
                password: hashedPassword,
                role: 'staff',
                isVerified: true
            });
            console.log('✅ Default Staff created (staff123)');
        }
    } catch (error) {
        console.error('Failed to seed DB contents:', error);
    }
};
export default seedAdmin;
