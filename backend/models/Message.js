import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    conversationType: { type: String, enum: ['direct', 'project-request'], default: 'direct' },
    projectRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest', default: null },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ projectRequest: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
