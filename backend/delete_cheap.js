import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://janendersh001_db_user:VYoYYYDsQsOFFC4G@ac-7azxqho-shard-00-00.rjqprt3.mongodb.net:27017/captainpizza?authSource=admin&ssl=true";

const menuItemSchema = new mongoose.Schema({
    category: String,
    subCategory: String
}, { strict: false });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
        const res = await MenuItem.deleteMany({
            $or: [
                { category: /cheap/i },
                { subCategory: /cheap/i }
            ]
        });
        console.log(`Deleted ${res.deletedCount} cheap items`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
