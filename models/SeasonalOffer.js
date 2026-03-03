import mongoose from 'mongoose';

const seasonalOfferSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, required: true, enum: ['PERCENT', 'AMOUNT'] },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    bannerImage: { type: String }, // Optional: specific image for the banner
    couponCode: { type: String, required: false } // Admin can attach a generic coupon code
}, {
    timestamps: true
});

const SeasonalOffer = mongoose.model('SeasonalOffer', seasonalOfferSchema);
export default SeasonalOffer;
