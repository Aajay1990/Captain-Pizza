import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Pizza', 'Burger', 'Wrap', 'Cheap Meal', etc.
    subCategory: { type: String }, // e.g., 'Simple Veg', 'Classic Veg' for pizzas
    desc: { type: String },
    image: { type: String }, // URL or filename path
    price: { type: Number }, // Unified price for burgers, wraps, etc.
    prices: { // Layered prices for pizzas
        small: { type: Number },
        medium: { type: Number },
        large: { type: Number }
    },
    isAvailable: { type: Boolean, default: true }
}, {
    timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
