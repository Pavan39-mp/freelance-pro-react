import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    client: { type: String, required: true }, // Legacy/display Client name
    clientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    clientName: { type: String, default: '' },
    clientEmail: { type: String, required: true },
    project: { type: String, required: true }, // Project Title
    provider: { type: String, enum: ['Google Meet', 'Zoom'], required: true },
    joinUrl: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    timeZone: { type: String, default: 'UTC' },
    agenda: { type: String, default: '' },
    notes: { type: String, default: '' },
    additionalParticipants: { type: String, default: '' },
    duration: { type: Number, default: 30 },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    // Retained for compatibility with legacy Freelancer meeting records.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

const Meeting = mongoose.model('Meeting', MeetingSchema);
export default Meeting;
