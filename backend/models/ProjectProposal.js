import mongoose from 'mongoose';

const ProjectProposalSchema = new mongoose.Schema({
    projectRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectRequest',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    proposedBudget: {
        type: Number,
        required: true,
        min: [0.01, 'Proposed budget must be greater than zero']
    },
    deliveryDays: {
        type: Number,
        required: true,
        min: [1, 'Delivery days must be at least one'],
        validate: {
            validator: Number.isInteger,
            message: 'Delivery days must be a whole number'
        }
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

ProjectProposalSchema.index({ projectRequest: 1, freelancer: 1 }, { unique: true });

const ProjectProposal = mongoose.model('ProjectProposal', ProjectProposalSchema);
export default ProjectProposal;
