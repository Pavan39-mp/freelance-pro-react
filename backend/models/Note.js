import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: '' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    reminderDate: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Note = mongoose.model('Note', NoteSchema);
export default Note;
