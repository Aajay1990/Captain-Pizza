import mongoose from 'mongoose';

// Permanently confirmed coupon usages — only inserted after successful payment
const couponUsageSchema = new mongoose.Schema({
    fingerprintId: { type: String, required: true },
    ipAddress:     { type: String },
    couponCode:    { type: String, required: true, uppercase: true },
    orderId:       { type: String }, // link to Order._id for tracing
    usedAt:        { type: Date, default: Date.now }
});

couponUsageSchema.index({ fingerprintId: 1, couponCode: 1 }); // fast duplicate lookup

const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);
export default CouponUsage;
