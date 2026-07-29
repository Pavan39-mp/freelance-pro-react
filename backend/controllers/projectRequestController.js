import ProjectRequest from '../models/ProjectRequest.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Create a new project request
// @route   POST /api/project-requests
// @access  Private (Client only)
export const createRequest = async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Only clients can create project requests',
                data: null
            });
        }

        const { freelancerId, title, description, budget, deadline } = req.body;
        const normalizedTitle = typeof title === 'string' ? title.trim() : '';
        const numericBudget = Number(budget);
        const deadlineDate = new Date(deadline);

        if (!normalizedTitle || !description?.trim() || !Number.isFinite(numericBudget) || numericBudget <= 0 || Number.isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Provide a title, description, positive budget, and a future deadline.',
                data: null
            });
        }

        // Verify freelancer exists and is a freelancer
        const freelancer = await User.findById(freelancerId);
        if (!freelancer || freelancer.role !== 'freelancer') {
            return res.status(404).json({
                success: false,
                message: 'Target freelancer not found or is invalid',
                data: null
            });
        }

        // Optional: If platform requires public discoverability to receive requests
        if (!freelancer.isPublicProfile) {
            return res.status(403).json({
                success: false,
                message: 'This freelancer is not currently accepting public requests',
                data: null
            });
        }

        // Duplicate protection: Check if identical pending request exists
        const existingRequest = await ProjectRequest.findOne({
            client: req.user._id,
            freelancer: freelancerId,
            title: normalizedTitle,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request sent to this freelancer. Please wait for them to respond.',
                data: null
            });
        }

        const projectRequest = await ProjectRequest.create({
            client: req.user._id, // Enforce client identity securely
            freelancer: freelancerId,
            title: normalizedTitle,
            description,
            budget: numericBudget,
            deadline: deadlineDate,
            status: 'pending'
        });

        // Trigger Notification Logic 
        // Note: As per instructions, only if the existing system safely supports it.
        // I will add a notification if the Notification model is available without breaking.
        // We will leave the Notification creation separate so it doesn't break the creation flow.

        res.status(201).json({
            success: true,
            message: 'Project request sent successfully',
            data: projectRequest
        });
    } catch (error) {
        console.error('Error creating project request:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error',
            data: null
        });
    }
};

// @desc    Get all project requests for the logged-in user
// @route   GET /api/project-requests
// @access  Private
export const getMyRequests = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'client') {
            query.client = req.user._id;
        } else if (req.user.role === 'freelancer') {
            query.freelancer = req.user._id;
        } else {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access',
                data: null
            });
        }

        const requests = await ProjectRequest.find(query)
            .populate('client', 'fullName email avatar')
            .populate('freelancer', 'fullName email avatar title skills')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Requests retrieved successfully',
            data: requests
        });
    } catch (error) {
        console.error('Error fetching project requests:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            data: null
        });
    }
};

// @desc    Update request status
// @route   PATCH /api/project-requests/:id/status
// @access  Private
export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ValidClientStatuses = ['cancelled'];
        const ValidFreelancerStatuses = ['accepted', 'rejected'];

        const request = await ProjectRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Project request not found',
                data: null
            });
        }

        // Only allow modifying 'pending' requests
        // Exception: No exceptions based on requirements. Once accepted/rejected/cancelled it stays that way.
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot change status of a request that is already ${request.status}`,
                data: null
            });
        }

        // Verify authorization and valid transition
        if (req.user.role === 'client') {
            // Must own it
            if (request.client.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to modify this request',
                    data: null
                });
            }
            if (!ValidClientStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Clients can only transition status to: ${ValidClientStatuses.join(', ')}`,
                    data: null
                });
            }
        } else if (req.user.role === 'freelancer') {
            // Must be the recipient
            if (request.freelancer.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to modify this request',
                    data: null
                });
            }
            if (!ValidFreelancerStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Freelancers can only transition status to: ${ValidFreelancerStatuses.join(', ')}`,
                    data: null
                });
            }
        } else {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized role',
                data: null
            });
        }

        request.status = status;
        await request.save();

        let createdProject = null;

        if (status === 'accepted') {
            const existingProject = await Project.findOne({ projectRequest: request._id });
            if (!existingProject) {
                createdProject = await Project.create({
                    name: request.title,
                    description: request.description,
                    budget: request.budget,
                    dueDate: request.deadline ? new Date(request.deadline).toISOString().split('T')[0] : '',
                    platformClient: request.client,
                    createdBy: request.freelancer, // Freelancer takes ownership dynamically
                    projectRequest: request._id,
                    status: 'To Do'
                });
            }
        }

        res.json({
            success: true,
            message: `Request status updated to ${status}`,
            data: request,
            project: createdProject
        });
    } catch (error) {
        console.error('Error updating project request status:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            data: null
        });
    }
};

// @desc    Delete a project request
// @route   DELETE /api/project-requests/:id
// @access  Private
export const deleteRequest = async (req, res) => {
    try {
        const request = await ProjectRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Project request not found',
                data: null
            });
        }

        // Only sender or receiver might be able to delete depending on logic, but usually only sender if pending
        if (request.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the requesting client can delete this request',
                data: null
            });
        }

        await ProjectRequest.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Request deleted permanently',
            data: {}
        });
    } catch (error) {
        console.error('Error deleting project request:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            data: null
        });
    }
};
