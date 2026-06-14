import mongoose from 'mongoose';

// Temporary pending coupon applications — auto-expire after 1 hour
const couponApplicationSchema = new mongoose.Schema({
    fingerprintId: { type: String, required: true },
    ipAddress:     { type: String },
    couponCode:    { type: String, required: true, uppercase: true },
    appliedAt:     { type: Date, default: Date.now },
    expiresAt:     { type: Date, required: true }
});

couponApplicationSchema.index({ fingerprintId: 1, couponCode: 1 });
couponApplicationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL auto-cleanup

const CouponApplication = mongoose.model('CouponApplication', couponApplicationSchema);
export default CouponApplication;
