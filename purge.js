import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MenuItemSchema = new mongoose.Schema({
    name: String,
    category: String,
    subCategory: String,
    price: Number,
    prices: Object,
    desc: String,
    image: String,
    isAvailable: Boolean
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

async function purge() {
    await mongoose.connect('mongodb+srv://Ajay1990:T3wY2pUe9dEwE4vj@clusterajay.r3ksc.mongodb.net/captain_pizza?retryWrites=true&w=majority');
    const r = await MenuItem.deleteMany({ $or: [{ category: /cheap/i }, { subCategory: /cheap/i }] });
    console.log('Deleted cheap items:', r.deletedCount);
    await mongoose.disconnect();
}

purge();
