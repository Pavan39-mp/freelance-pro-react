import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import { sendEmail } from '../services/emailService.js';

// @desc    Get meetings list
// @route   GET /api/meetings
// @access  Private
export const getMeetings = async (req, res, next) => {
    try {
        const meetings = await Meeting.find({ user: req.user._id }).sort({ date: 1, time: 1 });
        res.json({
            success: true,
            message: 'Meetings retrieved successfully',
            data: meetings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Schedule a new meeting
// @route   POST /api/meetings
// @access  Private
export const scheduleMeeting = async (req, res, next) => {
    try {
        const {
            title,
            client,
            clientEmail,
            project,
            provider,
            date,
            time,
            timeZone,
            agenda,
            notes,
            additionalParticipants,
            duration
        } = req.body;

        if (!title || !client || !clientEmail || !project || !provider || !date || !time) {
            res.status(400);
            throw new Error('Please fill in all required fields');
        }

        // Mock link generation
        const randomMeetingId = Math.random().toString(36).substring(2, 12);
        let joinUrl = '';
        if (provider === 'Google Meet') {
            joinUrl = `https://meet.google.com/${randomMeetingId.substring(0, 3)}-${randomMeetingId.substring(3, 7)}-${randomMeetingId.substring(7, 10)}`;
        } else {
            joinUrl = `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        }

        const meeting = await Meeting.create({
            title,
            client,
            clientEmail,
            project,
            provider,
            joinUrl,
            date,
            time,
            timeZone: timeZone || 'UTC',
            agenda,
            notes,
            additionalParticipants,
            duration: duration || 30,
            status: 'Scheduled',
            user: req.user._id
        });

        // Send email invitation templates
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded: 8px;">
        <h2 style="color: #4f46e5;">Meeting Invitation: ${title}</h2>
        <p>Hello there,</p>
        <p>You have been scheduled for a meeting with <strong>${req.user.fullName}</strong>. Here are the meeting details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Client:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${client}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Date/Time:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${date} at ${time} (${timeZone || 'UTC'})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Duration:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${duration} minutes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Provider:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${provider}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Agenda:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${agenda || 'No agenda specified.'}</td>
          </tr>
        </table>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${joinUrl}" target="_blank" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Meeting</a>
        </div>
      </div>
    `;

        const recipients = [clientEmail];
        if (additionalParticipants) {
            additionalParticipants.split(',').forEach(p => {
                const trimmed = p.trim();
                if (trimmed) recipients.push(trimmed);
            });
        }

        await sendEmail({
            to: recipients,
            subject: `Invitation: ${title}`,
            html: emailHtml
        });

        // Create Notification and Activity records
        await Notification.create({
            type: 'meeting',
            title: 'Meeting Scheduled',
            message: `Meeting "${title}" is scheduled with ${client} on ${date}.`,
            user: req.user._id
        });

        await Activity.create({
            action: 'created',
            taskName: title,
            type: 'meeting',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        res.status(201).json({
            success: true,
            message: 'Meeting scheduled successfully',
            data: meeting
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a meeting
// @route   PUT /api/meetings/:id
// @access  Private
export const updateMeeting = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user._id });
        if (!meeting) {
            res.status(404);
            throw new Error('Meeting not found');
        }

        meeting.title = req.body.title || meeting.title;
        meeting.date = req.body.date || meeting.date;
        meeting.time = req.body.time || meeting.time;
        meeting.timeZone = req.body.timeZone || meeting.timeZone;
        meeting.agenda = req.body.agenda !== undefined ? req.body.agenda : meeting.agenda;
        meeting.notes = req.body.notes !== undefined ? req.body.notes : meeting.notes;
        meeting.duration = req.body.duration !== undefined ? req.body.duration : meeting.duration;
        meeting.status = req.body.status || meeting.status;

        const updated = await meeting.save();

        res.json({
            success: true,
            message: 'Meeting updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private
export const deleteMeeting = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!meeting) {
            res.status(404);
            throw new Error('Meeting not found');
        }

        res.json({
            success: true,
            message: 'Meeting deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
