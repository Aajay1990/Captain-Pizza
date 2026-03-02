import User from '../models/User.js';
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
            console.log('✅ Default Admin created: Aajay Sharma (admin@captainpizza.com / admin123)');
        } else {
            // Update name to Aajay Sharma
            adminExists.name = 'Aajay Sharma';
            await adminExists.save();
            console.log('☑️ Admin name verified as Aajay Sharma.');
        }

        const staffEmail = 'staff@captainpizza.com';
        const staffExists = await User.findOne({ email: staffEmail });
        if (!staffExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('staff123', salt);

            await User.create({
                email: staffEmail,
                name: 'POS Register 1',
                password: hashedPassword,
                role: 'staff',
                isVerified: true
            });
            console.log('✅ Default Staff created: staff@captainpizza.com / staff123');
        } else {
            console.log('☑️ Staff account already exists. Skipping staff seed.');
        }

    } catch (error) {
        console.error('Failed to seed admin:', error);
    }
};

export default seedAdmin;
