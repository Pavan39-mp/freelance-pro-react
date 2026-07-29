import mongoose from 'mongoose';

const ProgressHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    prevProgress: { type: Number, required: true },
    newProgress: { type: Number, required: true },
    hoursWorked: { type: Number, required: true },
    summary: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: '' },
    user: { type: String, default: 'Alex Rivera' }
});

const CommentSchema = new mongoose.Schema({
    id: { type: String, required: true }, // UUID for frontend match
    user: { type: String, default: 'Alex Rivera' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const AttachmentSchema = new mongoose.Schema({
    id: { type: String, required: true }, // UUID for frontend match
    fileName: { type: String, required: true },
    size: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Normal', 'Low'], default: 'Normal' },
    deadline: { type: String, default: '' },
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed', 'On Hold'], default: 'To Do' },
    progress: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 10 },
    workedHours: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: '' },
    progressHistory: [ProgressHistorySchema],
    comments: [CommentSchema],
    attachments: [AttachmentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
export default Task;
