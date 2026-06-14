import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Check cookies first (HttpOnly)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // Fallback to Authorization Header (Bearer Token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_captain_pizza');
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, session expired.' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};
