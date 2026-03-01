import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create a transporter
    // For production, use a real SMTP service (SendGrid, Mailgun, or Gmail App Password)
    // Here we provide a structured setup. Using Ethereal (fake SMTP) as fallback for dev.

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT, // 465
        secure: true, // Use SSL/TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Define the email options
    const mailOptions = {
        from: `Captain Pizza <noreply@captainpizza.com>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    if (!process.env.SMTP_USER) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

export default sendEmail;
