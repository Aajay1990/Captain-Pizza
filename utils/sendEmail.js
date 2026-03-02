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

    const isGmail = host?.includes('gmail.com');

    console.log(`[EMAIL ATTEMPT] Target: ${options.email} | Provider: ${isGmail ? 'GMAIL SERVICE' : host}`);

    let transporterOptions = {
        auth: {
            user: user,
            pass: pass
        }
    };

    if (isGmail) {
        // Nodemailer's built-in Gmail service handles port/secure automatically
        transporterOptions.service = 'gmail';
    } else {
        transporterOptions.host = host;
        transporterOptions.port = port;
        transporterOptions.secure = (port === 465);
        transporterOptions.tls = {
            rejectUnauthorized: false
        };
    }

    const transporter = nodemailer.createTransport({
        ...transporterOptions,
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        logger: true,
        debug: true
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
        console.log(`[EMAIL SUCCESS] ${options.email}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL FATAL] ${err.message}`);
        return { success: false, error: err.message };
    }
};

export default sendEmail;
