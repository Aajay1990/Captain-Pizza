import express from 'express';
import SeasonalOffer from '../models/SeasonalOffer.js';

const router = express.Router();

// @desc    Get active seasonal offers
// @route   GET /api/offers/active
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const offers = await SeasonalOffer.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        res.status(200).json({ success: true, data: offers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching active offers' });
    }
});

export default router;
