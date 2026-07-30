const requiredGoogleConfig = () => {
    const config = {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary'
    };

    if (!config.clientId || !config.clientSecret || !config.refreshToken) {
        const error = new Error('Google Meet creation is temporarily unavailable.');
        error.statusCode = 503;
        throw error;
    }
    return config;
};

const addMinutes = (date, time, duration) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const value = new Date(Date.UTC(year, month - 1, day, hour, minute + Number(duration || 30)));
    return value.toISOString().slice(0, 16);
};

const getAccessToken = async (config) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: config.refreshToken,
            grant_type: 'refresh_token'
        })
    });
    const result = await response.json();
    if (!response.ok || !result.access_token) {
        const error = new Error('Google Meet creation is temporarily unavailable.');
        error.statusCode = 503;
        throw error;
    }
    return result.access_token;
};

export const createGoogleMeetEvent = async ({ title, date, time, timeZone, duration, attendees, description }) => {
    const config = requiredGoogleConfig();
    const accessToken = await getAccessToken(config);
    const requestId = `freelancepro-${Date.now()}-${randomUUID()}`;
    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summary: title,
                description,
                start: { dateTime: `${date}T${time}:00`, timeZone },
                end: { dateTime: `${addMinutes(date, time, duration)}:00`, timeZone },
                attendees: attendees.map(email => ({ email })),
                conferenceData: {
                    createRequest: {
                        requestId,
                        conferenceSolutionKey: { type: 'hangoutsMeet' }
                    }
                }
            })
        }
    );
    const event = await response.json();
    const meetingLink = event.hangoutLink || event.conferenceData?.entryPoints?.find(entry => entry.entryPointType === 'video')?.uri;
    if (!response.ok || !meetingLink) {
        const error = new Error('Google Meet creation is temporarily unavailable.');
        error.statusCode = 503;
        throw error;
    }
    return { meetingLink, calendarEventId: event.id };
};
import { randomUUID } from 'crypto';
