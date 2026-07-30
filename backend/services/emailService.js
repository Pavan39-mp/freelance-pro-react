import nodemailer from 'nodemailer';

const requiredEmailConfig = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];

const getEmailConfig = () => {
    const missing = requiredEmailConfig.filter((name) => !String(process.env[name] || '').trim());
    if (missing.length) {
        return { error: `Email service is not configured (${missing.join(', ')} missing)` };
    }

    const port = Number(process.env.EMAIL_PORT);
    if (!Number.isInteger(port) || port <= 0) {
        return { error: 'Email service is not configured (EMAIL_PORT is invalid)' };
    }

    return {
        host: process.env.EMAIL_HOST.trim(),
        port,
        secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM.trim()
    };
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const config = getEmailConfig();
    if (config.error) {
        console.error(`Email delivery failed: ${config.error}`);
        return { success: false, code: 'EMAIL_NOT_CONFIGURED' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });

        const info = await transporter.sendMail({
            from: config.from,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            text,
            html,
        });

        console.log('Email delivered successfully');
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const safeReason = error?.code || error?.responseCode || error?.name || 'UNKNOWN_ERROR';
        console.error(`Email delivery failed: ${safeReason}`);
        return { success: false, code: safeReason };
    }
};
