import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Made false for OTP only users
    phone: { type: String, unique: true, sparse: true }, // For OTP/SMS features
    role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    walletBalance: { type: Number, default: 0 },
    hasUsedWelcomeOffer: { type: Boolean, default: false },
    addresses: [{
        label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Other' },
        street: { type: String },
        city: { type: String },
        pinCode: { type: String }
    }]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
