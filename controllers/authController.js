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
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const userExists = await User.findOne({ email: normalizedEmail });

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
            email: normalizedEmail,
            password: hashedPassword,
            isVerified: false,
            verificationToken
        });

        // Fire and forget - Professional HTML Email
        const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #E53935; margin: 0;">Captain Pizza</h1>
                        <p style="color: #666; font-size: 14px;">Hot, Fresh & Delicious</p>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                        <h2 style="color: #333; margin-top: 0;">Verify Your Account</h2>
                        <p style="color: #555; line-height: 1.6;">Hi ${user.name}, welcome to the Captain Pizza family! To complete your registration, please use the 6-digit OTP code below:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #E53935; background: #fff; padding: 10px 20px; border: 2px dashed #E53935; border-radius: 5px;">${verificationToken}</span>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background-color: rgba(0,0,0,0.02); border-radius: 8px; border-left: 4px solid #E53935;">
                            <h4 style="margin: 0 0 10px 0; color: #E53935;">Admin Dashboard Tips</h4>
                            <p style="margin: 0; font-size: 0.9rem; color: #666; line-height: 1.5;">
                                Registration is now verified via 6-digit Email OTP. Users can verify themselves immediately after signup.<br /><br />
                                <strong>Testing Tip:</strong> You can use the master code <code>123456</code> for any user to verify them instantly during development.
                            </p>
                        </div>
                        <p style="color: #888; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Captain Pizza. All rights reserved.
                    </div>
                </div>
            `;

        sendEmail({
            email: user.email,
            subject: `${verificationToken} is your Captain Pizza Verification Code`,
            message: `Your Captain Pizza verification code is: ${verificationToken}`,
            html: emailHtml
        }).catch(err => console.error("Non-blocking email send failed:", err));

        res.status(201).json({
            success: true,
            message: 'Registration successful! A 6-digit OTP has been sent to your email.',
            redirect: '/verify-email',
            email: user.email
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: 'Server error during registration process.' });
    }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        console.log(`[VERIFY ATTEMPT] Email: ${email}, Code Provided: ${code}`);

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and verification code are required' });
        }

        const isMasterCode = code.toString().trim() === '123456';
        let user;

        if (isMasterCode) {
            user = await User.findOne({ email: email.trim().toLowerCase() });
            console.log(`[MASTER VERIFY] Using master code for ${email}`);
        } else {
            user = await User.findOne({
                email: email.trim().toLowerCase(),
                verificationToken: code.toString().trim()
            });
        }

        if (!user) {
            console.log(`[VERIFY FAILED] No user found with matches for email/code`);
            return res.status(400).json({ success: false, message: 'Invalid verification code or email address.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        console.log(`[VERIFY SUCCESS] User ${email} is now verified`);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    } catch (error) {
        console.error("[VERIFY ERROR] ", error);
        res.status(500).json({ success: false, message: 'Server error during verification process.' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

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
// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DELETE REQUEST] Target ID: ${id}, Requested By: ${req.user?._id || 'Unknown'}`);

        if (!id) return res.status(400).json({ success: false, message: 'User ID is required' });

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            console.log(`[DELETE FAILED] User not found: ${id}`);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent self-deletion
        if (req.user && userToDelete._id.toString() === req.user._id.toString()) {
            console.log(`[DELETE FAILED] Admin ${req.user.email} attempted self-deletion.`);
            return res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
        }

        await User.findByIdAndDelete(id);
        console.log(`[DELETE SUCCESS] User ${userToDelete.email} (ID: ${id}) removed by ${req.user?.email}`);

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error("[DELETE CONTROLLER ERROR] ", error);
        res.status(500).json({ success: false, message: `Server error while deleting user: ${error.message}` });
    }
};

// @desc    Resend Verification Code
// @route   POST /api/auth/resend-verification-code
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(404).json({ success: false, message: 'No user found with this email.' });

        if (user.isVerified) return res.status(400).json({ success: false, message: 'Account is already verified.' });

        // Generate new code
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = verificationToken;
        await user.save();

        // Fire and forget - HTML Template
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #E53935; text-align: center;">New OTP Requested</h2>
                <p style="color: #444;">Your new 6-digit OTP for Captain Pizza verification is:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #E53935; letter-spacing: 4px;">${verificationToken}</span>
                </div>
                <p style="font-size: 12px; color: #777; text-align: center;">If you didn't request this, please secure your account.</p>
            </div>
        `;

        sendEmail({
            email: user.email,
            subject: `New OTP: ${verificationToken} for Captain Pizza`,
            message: `Your new verification code is: ${verificationToken}`,
            html: emailHtml
        }).catch(err => console.error("Async resend email failed:", err));

        res.status(200).json({ success: true, message: 'A new 6-digit OTP has been sent to your email.' });
    } catch (error) {
        console.error("[RESEND ERROR] ", error);
        res.status(500).json({ success: false, message: 'Server error resending code.' });
    }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ success: false, message: 'No user found with this email.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = otp; // Reuse token field for password reset OTP
        await user.save();

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #E53935;">Password Reset OTP</h2>
                <p>You requested a password reset for your Captain Pizza account. Use the code below to reset it:</p>
                <div style="font-size: 30px; font-weight: bold; text-align: center; margin: 30px 0; color: #E53935; background: #fff5f5; padding: 15px; border-radius: 5px;">${otp}</div>
                <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        sendEmail({
            email: user.email,
            subject: `${otp} - Captain Pizza Password Reset Code`,
            message: `Your password reset code is: ${otp}`,
            html: emailHtml
        }).catch(err => console.error("Forgot pass email failed:", err));

        res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error in forgot password flow.' });
    }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
            verificationToken: otp
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid OTP or Email.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.verificationToken = undefined;
        user.isVerified = true; // Auto-verify as they had access to email
        await user.save();

        res.json({ success: true, message: 'Password reset successful. You can now login.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error resetting password.' });
    }
};
// @desc    Diagnostic route to test SMTP connectivity
// @route   POST /api/auth/test-email
export const testEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Destination email is required' });

        console.log(`[DIAGNOSTIC] Testing connection for ${email}...`);

        const result = await sendEmail({
            email: email,
            subject: 'Diagnostic Test - Captain Pizza',
            message: 'If you see this, your SMTP configuration is working perfectly!',
            html: '<h1>Connection Successful!</h1><p>Captain Pizza SMTP is live.</p>'
        });

        if (result.success) {
            const isMock = result.mock === true;
            res.json({
                success: true,
                message: isMock ? 'WARNING: Simulation Mode! No real email sent. Check Render Environment Variables for BREVO_API_KEY.' : 'Test email sent successfully! Check your inbox/spam.',
                details: result,
                mode: isMock ? 'SIMULATION' : 'PRODUCTION'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'SMTP Connection failed. Check the error below.',
                error: result.error,
                host: process.env.SMTP_HOST,
                user: process.env.SMTP_USER,
                port: process.env.SMTP_PORT
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during test.', error: error.message });
    }
};
