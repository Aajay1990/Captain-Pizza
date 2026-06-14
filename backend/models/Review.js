import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    profilePic: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    verifiedOrder: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
