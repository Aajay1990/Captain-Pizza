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

    // Clean up credentials (STRIP SPACES AUTOMATICALLY)
    const user = process.env.SMTP_USER?.trim().replace(/\s/g, '');
    const pass = process.env.SMTP_PASS?.trim().replace(/\s/g, '');

    console.log(`[ULTIMATE ATTEMPT] Sending to: ${options.email} via Gmail Service...`);

    // The simplest and most reliable way for Gmail on Render
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            // This is key for cloud servers to avoid handshake errors
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"Captain Pizza" <${user}>`, // MUST match the auth user
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SUCCESS] OTP sent to ${options.email}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL ERROR] Detailed Error: ${err.message}`);
        return { success: false, error: err.message };
    }
};

export default sendEmail;
