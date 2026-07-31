import mongoose from 'mongoose';
import ProjectProposal from '../models/ProjectProposal.js';
import ProjectRequest from '../models/ProjectRequest.js';

// @desc    Submit a proposal for an open marketplace project request
// @route   POST /api/project-proposals
// @access  Private (Freelancer only)
export const createProposal = async (req, res, next) => {
    try {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ success: false, message: 'Only freelancers can submit proposals', data: null });
        }

        const { projectRequest: projectRequestId, proposedBudget, deliveryDays, message } = req.body;
        const numericBudget = Number(proposedBudget);
        const numericDeliveryDays = Number(deliveryDays);
        const normalizedMessage = typeof message === 'string' ? message.trim() : '';

        if (!mongoose.Types.ObjectId.isValid(projectRequestId)) {
            return res.status(400).json({ success: false, message: 'A valid project request is required', data: null });
        }
        if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
            return res.status(400).json({ success: false, message: 'Proposed budget must be greater than zero', data: null });
        }
        if (!Number.isInteger(numericDeliveryDays) || numericDeliveryDays < 1) {
            return res.status(400).json({ success: false, message: 'Delivery days must be a positive whole number', data: null });
        }
        if (!normalizedMessage || normalizedMessage.length > 2000) {
            return res.status(400).json({ success: false, message: 'Proposal message is required and cannot exceed 2000 characters', data: null });
        }

        const projectRequest = await ProjectRequest.findById(projectRequestId).select('client requestType status');
        if (!projectRequest) {
            return res.status(404).json({ success: false, message: 'Project request not found', data: null });
        }
        if (projectRequest.requestType !== 'marketplace') {
            return res.status(400).json({ success: false, message: 'Proposals can only be submitted for marketplace projects', data: null });
        }
        if (projectRequest.status !== 'Open') {
            return res.status(400).json({ success: false, message: 'This marketplace project is no longer open for proposals', data: null });
        }
        if (String(projectRequest.client) === String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot submit a proposal to your own project request', data: null });
        }

        const existingProposal = await ProjectProposal.findOne({ projectRequest: projectRequest._id, freelancer: req.user._id }).select('_id');
        if (existingProposal) {
            return res.status(409).json({ success: false, message: 'You have already submitted a proposal for this project', data: null });
        }

        const proposal = await ProjectProposal.create({
            projectRequest: projectRequest._id,
            freelancer: req.user._id,
            proposedBudget: numericBudget,
            deliveryDays: numericDeliveryDays,
            message: normalizedMessage
        });

        return res.status(201).json({ success: true, message: 'Proposal submitted successfully', data: proposal });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: 'You have already submitted a proposal for this project', data: null });
        }
        next(error);
    }
};
