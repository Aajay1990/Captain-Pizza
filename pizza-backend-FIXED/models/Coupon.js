import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, required: true, enum: ['AMOUNT', 'PERCENT'] },
    discountValue: { type: Number, required: true }, // either amount like 50 (₹50 off) or 20 (20% off)
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
