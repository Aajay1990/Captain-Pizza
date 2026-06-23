import mongoose from 'mongoose';

const seasonalOfferSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priceMode: { type: String, enum: ['DISCOUNT', 'FIXED'], default: 'DISCOUNT' },
    discountType: { type: String, enum: ['PERCENT', 'AMOUNT'], default: 'PERCENT' },
    discountValue: { type: Number },
    fixedPrice: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    bannerImage: { type: String }, // User panel card image — 311×359px
    tvImage: { type: String },     // TV strip image — 509×434px (falls back to bannerImage if not set)
    couponCode: { type: String }
}, {
    timestamps: true
});

const SeasonalOffer = mongoose.model('SeasonalOffer', seasonalOfferSchema);
export default SeasonalOffer;
