import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import toppingRoutes from './routes/toppingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import seedAdmin from './utils/seedAdmin.js';
import seedMenu from './utils/seedMenu.js';
import seedReviews from './utils/seedReviews.js';

// Initialize environment variables mapping
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
    try {
        if (process.env.MONGO_URI) {
            await mongoose.connect(process.env.MONGO_URI, {
                family: 4,
                serverSelectionTimeoutMS: 5000
            });
            console.log('Database Connected Successfully to URI');
        } else {
            console.log('No MONGO_URI found. Starting isolated In-Memory MongoDB Server...');
            const mongoServer = await MongoMemoryServer.create();
            await mongoose.connect(mongoServer.getUri());
            console.log(`In-Memory MongoDB Connected at: ${mongoServer.getUri()}`);
        }

        // Seed initial admin user if not exists
        await seedAdmin();
        // Seed default menu if DB is empty for in-memory DB or first run
        await seedMenu();
        // Seed initial reviews if DB is empty
        await seedReviews();
    } catch (err) {
        console.error('Database connection failed', err);
    }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('API is running for Captain Pizza...');
});

// Setting server to listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
});
