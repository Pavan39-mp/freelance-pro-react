import mongoose from 'mongoose';

const ProjectRequestSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    budget: {
        type: Number,
        required: [true, 'Project budget is required'],
        min: [0, 'Budget must be a positive number']
    },
    deadline: {
        type: Date,
        required: [true, 'Project deadline is required']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

// Ensure a client cannot send duplicate pending requests to the same freelancer for the exact same project title
ProjectRequestSchema.index({ client: 1, freelancer: 1, title: 1, status: 1 });

const ProjectRequest = mongoose.model('ProjectRequest', ProjectRequestSchema);

export default ProjectRequest;
