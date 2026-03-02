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

    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    console.log(`[ULTIMATE SMTP ATTEMPT] Target: ${options.email} via Port 465 (Pool Enabled)`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // MUST be true for port 465
        pool: true,   // Use connection pooling to avoid frequent handshakes
        auth: {
            user: user,
            pass: pass
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 45000,
        tls: {
            rejectUnauthorized: false
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
        console.error(`[EMAIL ERROR] Critical Failure: ${err.message}`);
        return { success: false, error: err.message };
    }
};

export default sendEmail;
