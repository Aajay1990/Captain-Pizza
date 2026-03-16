import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import toppingRoutes from './routes/toppingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import seedAdmin from './utils/seedAdmin.js';
import seedMenu from './utils/seedMenu.js';
import seedReviews from './utils/seedReviews.js';
import http from 'http';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Allowed frontend origins (Hostinger + local dev + Vercel/Netlify previews)
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://captainpizza.in',
    'https://www.captainpizza.in',
    'http://captainpizza.in',
    'http://www.captainpizza.in',
];

app.use(cors({
    origin: (origin, callback) => {
        // allow curl / Postman / server-to-server with no origin
        if (!origin) return callback(null, true);
        // allow any *.hostingersite.com preview or *.onrender.com
        if (
            ALLOWED_ORIGINS.includes(origin) ||
            /hostingersite\.com$/i.test(origin) ||
            /netlify\.app$/i.test(origin) ||
            /vercel\.app$/i.test(origin) ||
            /onrender\.com$/i.test(origin)
        ) {
            return callback(null, true);
        }
        return callback(null, true); // Allow all for now – tighten later
    },
    credentials: true
}));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Server Start (Immediate for Render) ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is LIVE on port ${PORT}`);
    console.log(`📡 URL: ${process.env.RENDER_EXTERNAL_URL || 'Localhost'}`);
});

// ── Database Connection (Background) ──────────────────────────────────────────
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('⚠️ WARNING: MONGO_URI not defined in environment variables.');
            return;
        }
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 15000
        });
        console.log('✅ Database Connected Successfully');
        
        // Seed initial data
        try {
            await seedAdmin();
            await seedMenu();
            // Removed legacy review seeding
        } catch (seedErr) {
            console.warn('⚠️ Seeding skipped or partially failed:', seedErr.message);
        }
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
};

// Start DB connection in background to not block the port
connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/toppings', toppingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/coupon', couponRoutes);

// Health check endpoint (used by keep-alive ping)
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/', (req, res) => {
    res.send('🍕 Captain Pizza API is running!');
});

// ── Keep-Alive Ping (prevents Render free tier from sleeping) ─────────────────
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
    const healthUrl = `${SELF_URL}/health`;
    http.get(healthUrl, (res) => {
        if (res.statusCode === 200) {
            console.log(`🏓 Keep-alive ping successful: ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.error('❌ Keep-alive error:', err.message);
    });
}, 14 * 60 * 1000); // 14 minutes
