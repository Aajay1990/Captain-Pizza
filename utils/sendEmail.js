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

    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT?.trim()) || 587;
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    console.log(`[PROFESSIONAL SMTP] Sending via ${host}:${port}...`);

    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: (port === 465), // False for 587 (STARTTLS)
        auth: {
            user: user,
            pass: pass
        },
        connectionTimeout: 20000,
        tls: {
            // Essential for successful connection from cloud environments
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
        console.log(`[EMAIL DISPATCHED] ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[SMTP ERROR] ${err.message}`);
        return { success: false, error: err.message };
    }
};

export default sendEmail;
