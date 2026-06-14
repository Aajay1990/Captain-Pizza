import mongoose from 'mongoose';

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    prices: {
        small: { type: Number, required: true },
        medium: { type: Number, required: true },
        large: { type: Number, required: true }
    },
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Topping = mongoose.model('Topping', toppingSchema);
export default Topping;
