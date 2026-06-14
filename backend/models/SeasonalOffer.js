import mongoose from 'mongoose';

const seasonalOfferSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priceMode: { type: String, enum: ['DISCOUNT', 'FIXED'], default: 'DISCOUNT' },
    discountType: { type: String, enum: ['PERCENT', 'AMOUNT'], default: 'PERCENT' }, // Not required — FIXED mode doesn't use it
    discountValue: { type: Number },
    fixedPrice: { type: Number }, // Admin-set direct price (used when priceMode === 'FIXED')
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    bannerImage: { type: String },
    couponCode: { type: String } // Optional promo code shown to users
}, {
    timestamps: true
});

const SeasonalOffer = mongoose.model('SeasonalOffer', seasonalOfferSchema);
export default SeasonalOffer;
