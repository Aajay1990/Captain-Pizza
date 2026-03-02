import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // If no SMTP settings, simulation mode
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST) {
        console.log("-----------------------------------------");
        console.log(`[EMAIL SIMULATION] To: ${options.email}`);
        console.log(`[EMAIL SIMULATION] Message: ${options.message}`);
        console.log("-----------------------------------------");
        return { success: true, mock: true };
    }

    // Use Port 587 with secure: false for better compatibility on Render/Cloud
    const isSecure = process.env.SMTP_PORT == '465';

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: isSecure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 10000, // 10 seconds timeout
        tls: {
            rejectUnauthorized: false // Helps with some shared hosting connection issues
        }
    });

    const mailOptions = {
        from: `"Captain Pizza" <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Added HTML support
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] to ${options.email}`);
        return info;
    } catch (err) {
        console.error(`[EMAIL ERROR] Connection failed: ${err.message}`);
        // We don't throw error here to prevent blocking the user flow (they can use Master OTP)
        return { success: false, error: err.message };
    }
};

export default sendEmail;
