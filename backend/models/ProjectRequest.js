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
        default: null,
        required() { return this.requestType !== 'marketplace'; }
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
    category: {
        type: String,
        trim: true,
        default: '',
        required() { return this.requestType === 'marketplace'; }
    },
    skills: {
        type: [{ type: String, trim: true }],
        default: [],
        validate: {
            validator(value) { return this.requestType !== 'marketplace' || value.length > 0; },
            message: 'At least one skill is required'
        }
    },
    // Mixed preserves legacy targeted requests (numeric budget) while marketplace
    // requests store { min, max }. Both shapes are validated by the controller.
    budget: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Project budget is required'],
        validate: {
            validator(value) {
                if (this.requestType !== 'marketplace') return Number.isFinite(Number(value));
                return Number.isFinite(Number(value?.min)) && Number.isFinite(Number(value?.max)) && Number(value.min) <= Number(value.max);
            },
            message: 'A valid budget range is required'
        }
    },
    deadline: {
        type: Date,
        required: [true, 'Project deadline is required']
    },
    projectType: {
        type: String,
        enum: ['fixed-price', 'hourly'],
        default: undefined,
        required() { return this.requestType === 'marketplace'; }
    },
    requestType: {
        type: String,
        enum: ['targeted', 'marketplace'],
        default: 'targeted'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled', 'Open', 'Under Review', 'Assigned', 'Closed'],
        default: 'Open'
    }
}, { timestamps: true });

// Ensure a client cannot send duplicate pending requests to the same freelancer for the exact same project title
ProjectRequestSchema.index({ client: 1, freelancer: 1, title: 1, status: 1 });

const ProjectRequest = mongoose.model('ProjectRequest', ProjectRequestSchema);

export default ProjectRequest;
