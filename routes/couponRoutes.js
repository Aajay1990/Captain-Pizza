import express from 'express';
import Coupon from '../models/Coupon.js';
import CouponUsage from '../models/CouponUsage.js';
import CouponApplication from '../models/CouponApplication.js';
import Setting from '../models/Setting.js';
import SeasonalOffer from '../models/SeasonalOffer.js';
import Order from '../models/Order.js';

const router = express.Router();

// ───────────────────────────────────────────────
// Simple in-memory rate limiter (IP → count/time)
// ───────────────────────────────────────────────
const rateLimitMap = new Map(); // ip → { count, resetAt }

function checkRateLimit(ip) {
    const now = Date.now();
    const window = 60 * 1000; // 1 minute
    const limit = 5;

    let entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + window };
        rateLimitMap.set(ip, entry);
        return false; // not limited
    }
    entry.count++;
    if (entry.count > limit) return true; // BLOCKED
    return false;
}

// Helper: resolve client IP (handles proxies)
function getIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

// ═══════════════════════════════════════════════════════════════
// POST /api/coupon/apply  — tentative apply (no permanent mark)
// ═══════════════════════════════════════════════════════════════
router.post('/apply', async (req, res) => {
    const { coupon_code, fingerprint_id, order_total } = req.body;

    if (!coupon_code || !fingerprint_id) {
        return res.status(400).json({ success: false, message: 'coupon_code and fingerprint_id are required' });
    }

    const ip = getIP(req);
    const upperCode = coupon_code.toUpperCase().trim();

    // ── Rate limiting ────────────────────────────────────────────
    if (checkRateLimit(ip)) {
        return res.status(429).json({ success: false, message: 'Too many attempts. Please wait a minute.' });
    }

    try {
        // ── 1. Check localStorage guard (frontend also checks, but extra safety) ─
        // ── 2. Check if already permanently used by this fingerprint ─────────────
        const alreadyUsed = await CouponUsage.findOne({ fingerprintId: fingerprint_id, couponCode: upperCode });
        if (alreadyUsed) {
            return res.status(403).json({ success: false, message: '⚠️ Coupon already used on this device.' });
        }

        // ── 3. Check pending application (prevent double-apply in same session) ──
        const pending = await CouponApplication.findOne({
            fingerprintId: fingerprint_id,
            couponCode: upperCode,
            expiresAt: { $gt: new Date() }
        });
        if (pending) {
            // Still valid — return cached discount info
            return res.status(200).json({
                success: true,
                message: 'Coupon already applied. Complete your checkout.',
                alreadyPending: true
            });
        }

        // ── 4. Clean up expired applications for this fingerprint ─────────────────
        await CouponApplication.deleteMany({ fingerprintId: fingerprint_id, expiresAt: { $lte: new Date() } });

        // ── 5. Validate coupon ────────────────────────────────────────────────────
        let discountAmount = 0;
        let discountMessage = '';
        const orderTotal = Number(order_total) || 0;

        // 5a. WELCOME coupon
        if (upperCode.startsWith('WELCOME')) {
            const discountSetting = await Setting.findOne({ key: 'new_user_discount' });
            const pct = discountSetting ? Number(discountSetting.value) : 20;
            if (upperCode === `WELCOME${pct}`) {
                discountAmount = Math.round((orderTotal * pct) / 100);
                discountMessage = `Welcome Offer Applied (${pct}% off)!`;
            } else {
                return res.status(400).json({ success: false, message: 'Invalid welcome coupon code.' });
            }
        }

        // 5b. Seasonal setting coupon
        if (!discountMessage) {
            const sCoupon = await Setting.findOne({ key: 'seasonal_offer_coupon' });
            if (sCoupon && upperCode === sCoupon.value?.toString().toUpperCase()) {
                const sEnabled = await Setting.findOne({ key: 'seasonal_offer_enabled' });
                if (sEnabled?.value === 'true') {
                    const sDisc  = await Setting.findOne({ key: 'seasonal_offer_discount' });
                    const sType  = await Setting.findOne({ key: 'seasonal_offer_discount_type' });
                    const sMin   = await Setting.findOne({ key: 'seasonal_offer_min_order' });
                    const minVal = sMin ? Number(sMin.value) : 0;
                    if (orderTotal < minVal) {
                        return res.status(400).json({ success: false, message: `Minimum order ₹${minVal} required.` });
                    }
                    const dVal = sDisc ? Number(sDisc.value) : 15;
                    const dType = sType?.value || 'PERCENT';
                    discountAmount = dType === 'AMOUNT' ? dVal : Math.round((orderTotal * dVal) / 100);
                    discountMessage = 'Seasonal Offer Applied!';
                }
            }
        }

        // 5c. Active SeasonalOffer with couponCode
        if (!discountMessage) {
            const now = new Date();
            const seasonOffer = await SeasonalOffer.findOne({
                couponCode: upperCode, isActive: true,
                startDate: { $lte: now }, endDate: { $gte: now }
            });
            if (seasonOffer) {
                discountAmount = seasonOffer.discountType === 'AMOUNT'
                    ? seasonOffer.discountValue
                    : Math.round((orderTotal * seasonOffer.discountValue) / 100);
                discountMessage = 'Seasonal Offer Applied!';
            }
        }

        // 5d. Static Coupon from DB
        if (!discountMessage) {
            const coupon = await Coupon.findOne({ code: upperCode, isActive: true });
            if (!coupon) {
                return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
            }
            if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
                return res.status(400).json({ success: false, message: 'This coupon has expired.' });
            }
            if (orderTotal < coupon.minOrderAmount) {
                return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderAmount} required.` });
            }
            discountAmount = coupon.discountType === 'AMOUNT'
                ? coupon.discountValue
                : Math.round((orderTotal * coupon.discountValue) / 100);
            discountMessage = 'Coupon Applied!';
        }

        // ── 6. Insert pending application (expires in 1 hour) ─────────────────────
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1 hour
        await CouponApplication.create({ fingerprintId: fingerprint_id, ipAddress: ip, couponCode: upperCode, expiresAt });

        return res.status(200).json({
            success: true,
            discount: discountAmount,
            message: `✅ ${discountMessage} (-₹${discountAmount})`
        });

    } catch (err) {
        console.error('Apply coupon error:', err);
        return res.status(500).json({ success: false, message: 'Server error. Try again.' });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/coupon/confirm  — mark coupon as permanently used
//   Called AFTER successful payment / order creation
// ═══════════════════════════════════════════════════════════════
router.post('/confirm', async (req, res) => {
    const { coupon_code, fingerprint_id, order_id } = req.body;

    if (!coupon_code || !fingerprint_id) {
        return res.status(400).json({ success: false, message: 'coupon_code and fingerprint_id are required' });
    }

    const upperCode = coupon_code.toUpperCase().trim();
    const ip = getIP(req);

    try {
        // Find pending application
        const pending = await CouponApplication.findOne({
            fingerprintId: fingerprint_id,
            couponCode: upperCode,
            expiresAt: { $gt: new Date() }
        });

        if (!pending) {
            // No pending record — coupon was never applied or expired. Soft fail.
            return res.status(200).json({ success: false, message: 'No active coupon application found.' });
        }

        // Check not already confirmed (race condition guard)
        const alreadyConfirmed = await CouponUsage.findOne({ fingerprintId: fingerprint_id, couponCode: upperCode });
        if (alreadyConfirmed) {
            await CouponApplication.deleteOne({ _id: pending._id });
            return res.status(200).json({ success: true, message: 'Already confirmed.' });
        }

        // Optionally verify order exists and is paid
        if (order_id) {
            const order = await Order.findById(order_id);
            if (!order) {
                return res.status(400).json({ success: false, message: 'Order not found.' });
            }
        }

        // Move to permanent usage
        await CouponUsage.create({
            fingerprintId: fingerprint_id,
            ipAddress: pending.ipAddress || ip,
            couponCode: upperCode,
            orderId: order_id || null
        });

        // Delete pending record
        await CouponApplication.deleteOne({ _id: pending._id });

        // Increment usageCount on Coupon model if it exists
        await Coupon.findOneAndUpdate({ code: upperCode }, { $inc: { usageCount: 1 } });

        return res.status(200).json({ success: true, message: 'Coupon usage confirmed.' });

    } catch (err) {
        console.error('Confirm coupon error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/coupon/cancel  — remove pending application (user removed coupon from cart)
// ═══════════════════════════════════════════════════════════════
router.post('/cancel', async (req, res) => {
    const { coupon_code, fingerprint_id } = req.body;
    if (!coupon_code || !fingerprint_id) {
        return res.status(400).json({ success: false, message: 'Missing fields.' });
    }
    try {
        await CouponApplication.deleteMany({ fingerprintId: fingerprint_id, couponCode: coupon_code.toUpperCase() });
        return res.status(200).json({ success: true, message: 'Coupon application cancelled.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

export default router;
