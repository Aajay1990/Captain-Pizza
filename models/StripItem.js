import mongoose from 'mongoose';

const stripItemSchema = new mongoose.Schema({
    title:     { type: String, required: true },
    desc:      { type: String, default: '' },
    image:     { type: String, default: '' },   // URL or empty
    emoji:     { type: String, default: '🍕' },  // fallback display
    price:     { type: Number, default: 0 },
    badge:     { type: String, default: 'DEAL' },
    badgeClass:{ type: String, default: 'highlight' },  // 'highlight' | 'limit' | ''
    type:      { type: String, default: 'promo' },      // 'bogo' | 'action' | 'promo'
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const StripItem = mongoose.model('StripItem', stripItemSchema);
export default StripItem;
