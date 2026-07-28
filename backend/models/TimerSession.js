import mongoose from 'mongoose';

const TimerSessionSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds
    isManual: { type: Boolean, default: false },
    note: { type: String, default: '' },
    isActive: { type: Boolean, default: true } // true active, false completed/stopped
}, { timestamps: true });

const TimerSession = mongoose.model('TimerSession', TimerSessionSchema);
export default TimerSession;
