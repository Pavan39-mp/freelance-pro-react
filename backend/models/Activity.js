import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g. 'created', 'updated (20% -> 60%)'
    taskName: { type: String, default: '' },
    type: { type: String, default: 'task' }, // or 'client', 'project', etc.
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, default: 'Alex Rivera' }
}, { timestamps: true });

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;
