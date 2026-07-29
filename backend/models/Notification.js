import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['system', 'client', 'project', 'task', 'meeting', 'invoice'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
    link: { type: String, default: '' }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
