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
import Setting from './models/Setting.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import seedAdmin from './utils/seedAdmin.js';
import seedMenu from './utils/seedMenu.js';
import seedReviews from './utils/seedReviews.js';
import http from 'http';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global crash logger
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    try {
        fs.appendFileSync(path.join(__dirname, 'backend_errors.log'), `${new Date().toISOString()} - UNCAUGHT EXCEPTION: ${err.stack || err}\n`);
    } catch {}
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
    try {
        fs.appendFileSync(path.join(__dirname, 'backend_errors.log'), `${new Date().toISOString()} - UNHANDLED REJECTION: ${reason?.stack || reason}\n`);
    } catch {}
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Allowed frontend origins (Hostinger + local dev + Vercel/Netlify previews)
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    // Primary live domain
    'https://captainpizza.online',
    'https://www.captainpizza.online',
    'http://captainpizza.online',
    'http://www.captainpizza.online',
    // Legacy / fallback domain
    'https://captainpizza.in',
    'https://www.captainpizza.in',
    'http://captainpizza.in',
    'http://www.captainpizza.in',
];

// Handle Private Network Access (PNA) preflight requests
app.use((req, res, next) => {
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    next();
});

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

// ── Store Hours Auto-Cron function (defined first so it can be referenced below) ──
const runStoreHoursCron = async () => {
    // DB must be ready
    if (mongoose.connection.readyState !== 1) {
        console.warn('⏳ Cron skipped: DB not ready yet');
        return;
    }

    try {
        // Only run if auto-hours is enabled
        const autoHoursSetting = await Setting.findOne({ key: 'store_auto_hours' });
        if (!autoHoursSetting || autoHoursSetting.value !== 'true') return;

        const openTimeSetting  = await Setting.findOne({ key: 'store_open_time' });
        const closeTimeSetting = await Setting.findOne({ key: 'store_close_time' });

        if (!openTimeSetting || !closeTimeSetting) return;

        const openTime  = openTimeSetting.value;   // e.g. "11:00"
        const closeTime = closeTimeSetting.value;  // e.g. "23:00"

        // Get current IST time as HH:MM
        const now = new Date();
        const istFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const istTime = istFormatter.format(now).replace(/^24/, '00');

        const shouldBeOpen = istTime >= openTime && istTime < closeTime;
        const newStatus = shouldBeOpen ? 'open' : 'closed';

        // Only write if status changed
        const current = await Setting.findOne({ key: 'store_status' });
        if (!current || current.value !== newStatus) {
            await Setting.findOneAndUpdate(
                { key: 'store_status' },
                { value: newStatus },
                { upsert: true, new: true }
            );
            console.log(`🕐 Store Hours Cron: status → "${newStatus}" at IST ${istTime}`);
        }
    } catch (err) {
        console.error('❌ Store hours cron error:', err.message);
        throw err; // re-throw so /cron/ping can return 500
    }
};

// ── External Cron Trigger Endpoint ────────────────────────────────────────────
// Call this from cron-job.org or UptimeRobot every 10 minutes:
//   GET https://your-backend.onrender.com/cron/ping?secret=YOUR_CRON_SECRET
app.get('/cron/ping', async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (secret && req.query.secret !== secret) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    try {
        await runStoreHoursCron();
        console.log('🌐 External cron ping received — store hours check complete');
        res.json({ success: true, message: 'Cron executed', time: new Date().toISOString() });
    } catch (err) {
        console.error('❌ Cron ping error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Keep-Alive Ping (fallback — external cron is the primary driver) ───────────
// NOTE: Self-ping does NOT prevent Render free-tier sleep.
// Use cron-job.org to hit /cron/ping every 10 min instead (see above).
const SELF_URL = process.env.RENDER_EXTERNAL_URL
    ? process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '')
    : `http://localhost:${PORT}`;

setInterval(() => {
    fetch(`${SELF_URL}/health`)
        .then(r => {
            if (r.ok) console.log(`🏓 Keep-alive ping OK: ${r.status}`);
            else console.log(`⚠️ Keep-alive ping status: ${r.status}`);
        })
        .catch(err => console.error('❌ Keep-alive error:', err.message));
}, 14 * 60 * 1000); // every 14 min

// Run store hours cron immediately on startup, then every 60 seconds
setTimeout(runStoreHoursCron, 8000); // 8s delay to let DB connect first
setInterval(runStoreHoursCron, 60 * 1000);
