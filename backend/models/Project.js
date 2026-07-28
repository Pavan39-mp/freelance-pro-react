import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, // Existing CRM mapping loosely required
    platformClient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Authenticated Platform Client Tracker
    projectRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest' }, // Request Identifier preventing Duplicates
    description: { type: String, default: '' },
    budget: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    startDate: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    priority: { type: String, enum: ['High', 'Normal', 'Low'], default: 'Normal' },
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed', 'On Hold'], default: 'To Do' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);
export default Project;
