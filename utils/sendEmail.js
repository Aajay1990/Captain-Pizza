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

    const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    // Gmail usually works BEST on Port 465 with explicit SSL on Cloud servers like Render
    console.log(`[FINAL EMAIL ATTEMPT] To: ${options.email} using Port 465 (SSL)`);

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Let nodemailer handle the heavy lifting for Gmail
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for 587
        auth: {
            user: user,
            pass: pass
        },
        timeout: 25000, // 25 seconds for slow network
        tls: {
            rejectUnauthorized: false // Skip self-signed cert issues
        }
    });

    const mailOptions = {
        from: `"Captain Pizza" <${user}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SUCCESS] OTP delivered to ${options.email}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL ERROR] Primary Port Failed: ${err.message}`);
        return { success: false, error: err.message };
    }
};

export default sendEmail;
