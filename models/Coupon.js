import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, required: true, enum: ['AMOUNT', 'PERCENT'] },
    discountValue: { type: Number, required: true }, // either amount like 50 (₹50 off) or 20 (20% off)
    minOrderAmount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    validDays: { type: [String], default: [] }, // e.g. ["Monday", "Tuesday"]
    validStartTime: { type: String, default: '00:00' }, // "HH:mm"
    validEndTime: { type: String, default: '23:59' }, // "HH:mm"
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
