import mongoose from 'mongoose';
import ProjectProposal from '../models/ProjectProposal.js';
import ProjectRequest from '../models/ProjectRequest.js';
import FreelancerReview from '../models/FreelancerReview.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

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

// @desc    Get the authenticated freelancer's submitted proposals
// @route   GET /api/project-proposals/mine
// @access  Private (Freelancer only)
export const getMyProposals = async (req, res, next) => {
    try {
        const proposals = await ProjectProposal.find({ freelancer: req.user._id })
            .select('projectRequest proposedBudget deliveryDays message status createdAt')
            .sort({ createdAt: -1 });
        return res.json({ success: true, message: 'Proposals retrieved successfully', data: proposals });
    } catch (error) {
        next(error);
    }
};

// @desc    Get marketplace requests owned by the client with proposal counts
// @route   GET /api/project-proposals/client
// @access  Private (Client only)
export const getClientProposalProjects = async (req, res, next) => {
    try {
        const requests = await ProjectRequest.find({ client: req.user._id, requestType: 'marketplace' })
            .select('title category skills budget deadline projectType status createdAt')
            .sort({ createdAt: -1 });
        const counts = await ProjectProposal.aggregate([
            { $match: { projectRequest: { $in: requests.map(request => request._id) } } },
            { $group: { _id: '$projectRequest', count: { $sum: 1 } } }
        ]);
        const countByRequest = new Map(counts.map(item => [String(item._id), item.count]));
        return res.json({
            success: true,
            message: 'Client marketplace projects retrieved successfully',
            data: requests.map(request => ({
                ...request.toObject(),
                proposalCount: countByRequest.get(String(request._id)) || 0
            }))
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get proposals for one marketplace request owned by the client
// @route   GET /api/project-proposals/:projectRequestId
// @access  Private (Client owner only)
export const getProjectProposals = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectRequestId)) {
            return res.status(400).json({ success: false, message: 'Invalid project request ID', data: null });
        }
        const request = await ProjectRequest.findOne({
            _id: req.params.projectRequestId,
            client: req.user._id,
            requestType: 'marketplace'
        }).select('title status');
        if (!request) {
            return res.status(404).json({ success: false, message: 'Marketplace project request not found', data: null });
        }

        const proposals = await ProjectProposal.find({ projectRequest: request._id })
            .populate('freelancer', 'fullName avatar title skills experienceYears')
            .sort({ createdAt: -1 });
        const data = await Promise.all(proposals.map(async proposal => {
            const freelancerId = proposal.freelancer?._id;
            const [reviews, completedProjects] = await Promise.all([
                FreelancerReview.find({ freelancer: freelancerId }).select('rating'),
                Project.find({ createdBy: freelancerId, status: 'Completed' })
                    .select('name updatedAt projectRequest')
                    .populate('projectRequest', 'category skills')
                    .sort({ updatedAt: -1 })
            ]);
            const averageRating = reviews.length > 0
                ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1))
                : 0;
            return {
                _id: proposal._id,
                proposedBudget: proposal.proposedBudget,
                deliveryDays: proposal.deliveryDays,
                message: proposal.message,
                status: proposal.status,
                createdAt: proposal.createdAt,
                freelancer: {
                    _id: freelancerId,
                    name: proposal.freelancer?.fullName || 'Freelancer',
                    profilePicture: proposal.freelancer?.avatar || '',
                    title: proposal.freelancer?.title || '',
                    skills: proposal.freelancer?.skills || '',
                    experienceYears: proposal.freelancer?.experienceYears || 0,
                    averageRating,
                    totalReviews: reviews.length,
                    completedProjects: completedProjects.length,
                    previousWork: completedProjects.map(project => ({
                        _id: project._id,
                        title: project.name,
                        category: project.projectRequest?.category || 'Project',
                        skills: project.projectRequest?.skills || [],
                        completionDate: project.updatedAt
                    }))
                }
            };
        }));

        return res.json({ success: true, message: 'Project proposals retrieved successfully', data: { projectRequest: request, proposals: data } });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept or reject a proposal and convert an accepted proposal into a Project
// @route   PATCH /api/project-proposals/:proposalId/status
// @access  Private (Client owner only)
export const updateProposalStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Proposal status must be Accepted or Rejected', data: null });
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.proposalId)) {
            return res.status(400).json({ success: false, message: 'Invalid proposal ID', data: null });
        }
        const proposal = await ProjectProposal.findById(req.params.proposalId);
        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found', data: null });
        }
        const request = await ProjectRequest.findOne({
            _id: proposal.projectRequest,
            client: req.user._id,
            requestType: 'marketplace'
        });
        if (!request) {
            return res.status(403).json({ success: false, message: 'Not authorized to manage this proposal', data: null });
        }
        if (proposal.status !== 'Pending' && !(status === 'Accepted' && proposal.status === 'Accepted')) {
            return res.status(400).json({ success: false, message: `Proposal is already ${proposal.status}`, data: null });
        }

        let createdProject = null;
        if (status === 'Accepted') {
            const acceptedProposal = await ProjectProposal.findOne({
                projectRequest: request._id,
                status: 'Accepted',
                _id: { $ne: proposal._id }
            }).select('_id');
            if (acceptedProposal) {
                return res.status(409).json({ success: false, message: 'A proposal has already been accepted for this project', data: null });
            }

            const alreadyAssignedToFreelancer = request.status === 'Assigned'
                && String(request.freelancer) === String(proposal.freelancer);
            if (!alreadyAssignedToFreelancer) {
                const claimedRequest = await ProjectRequest.findOneAndUpdate(
                    {
                        _id: request._id,
                        client: req.user._id,
                        requestType: 'marketplace',
                        status: { $in: ['Open', 'Under Review'] }
                    },
                    { $set: { status: 'Assigned', freelancer: proposal.freelancer } },
                    { new: true }
                );
                if (!claimedRequest) {
                    return res.status(409).json({ success: false, message: 'A proposal has already been accepted for this project', data: null });
                }
            }

            createdProject = await Project.findOne({ projectRequest: request._id });
            const isNewProject = !createdProject;
            if (!createdProject) {
                createdProject = await Project.create({
                    name: request.title,
                    description: request.description,
                    budget: proposal.proposedBudget,
                    dueDate: request.deadline ? new Date(request.deadline).toISOString().split('T')[0] : '',
                    platformClient: req.user._id,
                    createdBy: proposal.freelancer,
                    projectRequest: request._id,
                    status: 'To Do'
                });
            }

            proposal.status = 'Accepted';
            await Promise.all([
                proposal.save(),
                ProjectProposal.updateMany(
                    { projectRequest: request._id, _id: { $ne: proposal._id }, status: 'Pending' },
                    { status: 'Rejected' }
                )
            ]);

            if (isNewProject) {
                await Notification.insertMany([
                    {
                        type: 'project',
                        title: 'Project Created',
                        message: 'Freelancer accepted and project created',
                        user: req.user._id,
                        sender: proposal.freelancer,
                        link: '/client/projects'
                    },
                    {
                        type: 'project',
                        title: 'Selected for Project',
                        message: 'You have been selected for a project',
                        user: proposal.freelancer,
                        sender: req.user._id,
                        link: '/freelancer/projects'
                    }
                ]);
            }
        } else {
            proposal.status = 'Rejected';
            await proposal.save();
        }

        return res.json({
            success: true,
            message: `Proposal ${status.toLowerCase()} successfully`,
            data: proposal,
            project: createdProject
        });
    } catch (error) {
        next(error);
    }
};
