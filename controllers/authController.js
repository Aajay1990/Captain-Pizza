import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with Verification disabled
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationToken
        });

        if (user) {
            // Send Verification Email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify your Captain Pizza Account',
                    message: `Hi ${user.name},\n\nWelcome to Captain Pizza! Please verify your account using the code below:\n\nVerification Code: ${verificationToken}\n\nThank you for choosing us!`
                });
            } catch (err) {
                console.error("Email send failed:", err);
            }

            res.status(201).json({
                success: true,
                message: 'Registration successful! Please check your email for the 6-digit verification code.',
                redirect: '/verify-email',
                email: user.email
            });
        }
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: 'Server error during registration process.' });
    }
};

// @desc    Verify Email
// @route   GET /api/auth/verify/:token
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email, verificationToken: code });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid verification code or email.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Send a script snippet that closes the verification window easily, or redirect directly to the frontend app port 5173
        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during verification process.' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Email address has not been verified. Please check your inbox for the verification link.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret_for_dev_captain_pizza', {
            expiresIn: '30d'
        });

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, hasUsedWelcomeOffer: user.hasUsedWelcomeOffer }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during login process.' });
    }
};

// @desc    Get all registered users (Admin only)
// @route   GET /api/auth/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error retrieving users.' });
    }
};

// @desc    Send magic OTP to phone
// @route   POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await User.findOne({ phone });
        if (!user) {
            // Auto register the user via Phone if doesn't exist
            user = await User.create({
                email: `${phone}@captainpizza.temp`,
                phone,
                isVerified: true, // OTP implies verified phone
                role: 'customer'
            });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Simulate sending SMS
        console.log(`[SMS MOCK] OTP sent to ${phone}: ${otp}`);

        res.json({ success: true, message: `OTP sent to ${phone}`, devOtp: otp }); // We return devOtp so it's easy to test without real Twilio!
    } catch (error) {
        console.error("OTP Error", error);
        res.status(500).json({ success: false, message: 'Server error sending OTP.' });
    }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await User.findOne({ phone, otp });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(401).json({ success: false, message: 'OTP Expired.' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_for_dev_captain_pizza', {
            expiresIn: '30d'
        });

        res.json({
            success: true,
            message: 'OTP Login successful.',
            token,
            user: { _id: user._id, email: user.email, role: user.role, hasUsedWelcomeOffer: user.hasUsedWelcomeOffer }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error verifying OTP.' });
    }
};
