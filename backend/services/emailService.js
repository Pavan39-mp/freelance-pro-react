import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: parseInt(process.env.EMAIL_PORT) || 2525,
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || '',
            },
        });

        const info = await transporter.sendMail({
            from: `"FreelancePro" <${process.env.EMAIL_USER || 'noreply@freelancepro.com'}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });

        console.log('[EMAIL DISPATCH] Message sent successfully');
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[EMAIL FAIL] Could not dispatch email: ${error.message}`);
        return { success: false, error: error.message };
    }
};
