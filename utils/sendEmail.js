import axios from 'axios';

const sendEmail = async (options) => {
    // CRITICAL: Strip any and all hidden spaces/newlines from the key
    const apiKey = process.env.BREVO_API_KEY?.replace(/[^a-zA-Z0-9_-]/g, '').trim();
    const senderEmail = process.env.SMTP_USER?.trim();

    if (!apiKey) {
        console.log("-----------------------------------------");
        console.log("!!! BREVO_API_KEY IS MISSING IN RENDER !!!");
        console.log(`[SIMULATION] Sending to: ${options.email}`);
        console.log("-----------------------------------------");
        return { success: true, mock: true, warning: 'BREVO_API_KEY is missing' };
    }

    console.log(`[BREVO API] Dispatching to ${options.email} via ${senderEmail || 'default'}...`);

    try {
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: {
                name: "Captain Pizza",
                email: senderEmail || "noreply@captainpizza.com"
            },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html || options.message
        }, {
            headers: {
                'api-key': apiKey,
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });

        console.log(`[BREVO API SUCCESS] ID: ${response.data.messageId}`);
        return { success: true, messageId: response.data.messageId, mode: 'PRODUCTION' };
    } catch (err) {
        const serverResponse = err.response?.data;
        const errorMsg = serverResponse?.message || err.message;
        const errorCode = serverResponse?.code || 'UNKNOWN_ERROR';

        console.error(`[BREVO API ERROR] Code: ${errorCode} | Message: ${errorMsg}`);

        return {
            success: false,
            error: errorMsg,
            code: errorCode,
            fullResponse: serverResponse,
            hint: errorCode === 'unauthorized' ? 'Invalid API Key' : 'Check if sender email is verified in Brevo'
        };
    }
};

export default sendEmail;
