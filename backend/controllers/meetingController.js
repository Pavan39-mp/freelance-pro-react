import Meeting from '../models/Meeting.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

const participantFilter = (user) => user.role === 'client'
    ? { $or: [{ clientUser: user._id }, { clientEmail: user.email }] }
    : { $or: [{ freelancer: user._id }, { user: user._id }] };

const isValidMeetingUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
};

const populateMeeting = (query) => query
    .populate('freelancer', 'fullName email avatar')
    .populate('clientUser', 'fullName email avatar')
    .populate('user', 'fullName email avatar');

// @desc    Get meetings list
// @route   GET /api/meetings
// @access  Private
export const getMeetings = async (req, res, next) => {
    try {
        const meetings = await populateMeeting(Meeting.find(participantFilter(req.user))).sort({ date: 1, time: 1 });
        res.json({
            success: true,
            message: 'Meetings retrieved successfully',
            data: meetings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get one meeting for a participant
// @route   GET /api/meetings/:id
// @access  Private
export const getMeetingById = async (req, res, next) => {
    try {
        const meeting = await populateMeeting(Meeting.findOne({ _id: req.params.id, ...participantFilter(req.user) }));
        if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found', data: null });
        return res.json({ success: true, message: 'Meeting retrieved successfully', data: meeting });
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
            clientId,
            project,
            provider,
            date,
            time,
            timeZone,
            agenda,
            notes,
            additionalParticipants,
            duration,
            meetingLink
        } = req.body;

        if (!title || !clientId || !project || !provider || !date || !time || !meetingLink) {
            res.status(400);
            throw new Error('Please fill in all required fields');
        }

        const clientUser = await User.findOne({ _id: clientId, role: 'client' });
        if (!clientUser) return res.status(400).json({ success: false, message: 'Selected Client account could not be resolved.', data: null });
        if (!isValidMeetingUrl(meetingLink)) return res.status(400).json({ success: false, message: 'Please provide a valid meeting URL.', data: null });
        const clientName = clientUser.fullName;

        const meeting = await Meeting.create({
            title,
            freelancer: req.user._id,
            client: clientName,
            clientUser: clientUser._id,
            clientName,
            clientEmail: clientUser.email,
            project,
            provider,
            joinUrl: meetingLink,
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
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">${clientName}</td>
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
          <a href="${meetingLink}" target="_blank" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Meeting</a>
        </div>
      </div>
    `;

        const recipients = [clientUser.email];
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
            title: 'New meeting scheduled',
            message: `${req.user.fullName} scheduled "${title}" for ${date} at ${time}.`,
            user: clientUser._id,
            sender: req.user._id,
            meeting: meeting._id,
            link: `/client/meetings?meetingId=${meeting._id}`
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
            data: await populateMeeting(Meeting.findById(meeting._id))
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
        const meeting = await Meeting.findOne({ _id: req.params.id, $or: [{ freelancer: req.user._id }, { user: req.user._id }] });
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
        if (req.body.meetingLink !== undefined) {
            if (!isValidMeetingUrl(req.body.meetingLink)) return res.status(400).json({ success: false, message: 'Please provide a valid meeting URL.', data: null });
            meeting.joinUrl = req.body.meetingLink;
        }

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
        const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, $or: [{ freelancer: req.user._id }, { user: req.user._id }] });
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
