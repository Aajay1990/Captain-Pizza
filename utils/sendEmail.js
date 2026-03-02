import axios from 'axios';

const sendEmail = async (options) => {
    // If no API Key, use simulation mode
    const apiKey = process.env.BREVO_API_KEY?.trim();
    const senderEmail = process.env.SMTP_USER?.trim();

    if (!apiKey) {
        console.log("-----------------------------------------");
        console.log("!!! BREVO_API_KEY NOT FOUND. SIMULATING EMAIL !!!");
        console.log(`[SIMULATION] To: ${options.email} | Subject: ${options.subject}`);
        console.log("-----------------------------------------");
        return { success: true, mock: true };
    }

    console.log(`[BREVO API ATTEMPT] Sending to: ${options.email}...`);

    try {
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: "Captain Pizza", email: senderEmail || "noreply@captainpizza.com" },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html || options.message
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[BREVO API SUCCESS] Message ID: ${response.data.messageId}`);
        return { success: true, messageId: response.data.messageId };
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error(`[BREVO API CRITICAL ERROR] ${errorMsg}`);
        return { success: false, error: errorMsg };
    }
};

export default sendEmail;
