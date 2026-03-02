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

    // Ensure values are clean
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT?.trim()) || 587;
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    // Use Port 465 for SSL, others for STARTTLS (secure: false)
    const isSecure = port === 465;

    console.log(`[EMAIL ATTEMPT] Preparing to send to ${options.email} via ${host}:${port} (Secure: ${isSecure})`);

    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: isSecure,
        auth: {
            user: user,
            pass: pass
        },
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 15000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false, // Essential for many shared/cloud hosts
            minVersion: 'TLSv1.2'
        },
        debug: true, // Enable internal logging
        logger: true
    });

    const mailOptions = {
        from: `"Captain Pizza" <${user}>`, // Must match SMTP user for many providers
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SUCCESS] Message ID: ${info.messageId} sent to ${options.email}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL CRITICAL ERROR] Destination: ${options.email} | Error: ${err.message}`);
        console.error(`[SMT DETAILS] Host: ${host}, User: ${user}, Port: ${port}`);

        // This time, we return the full error so we can debug it via API
        return { success: false, error: err.message, stack: err.stack };
    }
};

export default sendEmail;
