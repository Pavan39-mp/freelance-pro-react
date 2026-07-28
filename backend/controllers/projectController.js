import Project from '../models/Project.js';
import Client from '../models/Client.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';

export const getProjects = async (req, res, next) => {
    try {
        const { search, status, priority, client, page, limit, sortBy, sortOrder, paginate } = req.query;
        let query = {};

        // Differentiate visibility boundaries
        if (req.user.role === 'client') {
            query.platformClient = req.user._id;
        } else {
            query.createdBy = req.user._id;
        }

        // Filters
        if (status) {
            const statusArray = status.split(',');
            if (statusArray.length > 1) {
                query.status = { $in: statusArray };
            } else {
                query.status = status;
            }
        }
        if (priority) {
            const priorityArray = priority.split(',');
            if (priorityArray.length > 1) {
                query.priority = { $in: priorityArray };
            } else {
                query.priority = priority;
            }
        }
        if (client) {
            query.client = client;
        }

        // Search
        const safeSearch = typeof search === 'string' ? search : '';
        if (safeSearch) {
            const escapedSearch = safeSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            // Find clients matching search
            const matchingClients = await Client.find({
                createdBy: req.user.role === 'freelancer' ? req.user._id : undefined,
                fullName: { $regex: escapedSearch, $options: 'i' }
            });
            const clientIds = matchingClients.map(c => c._id);

            query.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { status: { $regex: escapedSearch, $options: 'i' } },
                { client: { $in: clientIds } }
            ];
        }

        const sortField = sortBy === 'name' ? 'name' : (sortBy === 'deadline' ? 'dueDate' : (sortBy || 'createdAt'));
        const order = sortOrder === 'asc' ? 1 : -1;
        const sortQuery = { [sortField]: order };

        const mustPaginate = paginate === 'true' || page !== undefined;
        let projects;
        let totalCount = 0;
        let totalPages = 1;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (mustPaginate) {
            totalCount = await Project.countDocuments(query);
            totalPages = Math.ceil(totalCount / limitNum);
            projects = await Project.find(query)
                .populate('client')
                .populate('platformClient', 'fullName email avatar company phone')
                .populate('createdBy', 'fullName email avatar title skills bio experience portfolio isPublicProfile')
                .sort(sortQuery)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);

            res.json({
                success: true,
                message: 'Projects retrieved successfully',
                data: {
                    items: projects,
                    totalCount,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            });
        } else {
            projects = await Project.find(query)
                .populate('client')
                .populate('platformClient', 'fullName email avatar company phone')
                .populate('createdBy', 'fullName email avatar title skills bio experience portfolio isPublicProfile')
                .sort(sortQuery);
            res.json({
                success: true,
                message: 'Projects retrieved successfully',
                data: projects
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client')
            .populate('platformClient', 'fullName email avatar')
            .populate('createdBy', 'fullName email avatar title skills bio experience portfolio isPublicProfile');

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        // Project access bounds: Freelancer (createdBy) OR Client (platformClient)
        const isOwner = project.createdBy && project.createdBy._id.toString() === req.user._id.toString();
        const isPlatformClient = project.platformClient && project.platformClient._id.toString() === req.user._id.toString();

        if (!isOwner && !isPlatformClient) {
            res.status(403);
            throw new Error('Not authorized to access this project');
        }

        res.json({
            success: true,
            message: 'Project retrieved successfully',
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
    try {
        const {
            name,
            title,
            client,
            description,
            budget,
            hourlyRate,
            startDate,
            dueDate,
            deadline,
            priority,
            status,
            progress,
            tags
        } = req.body;

        const useName = name || title;
        if (!useName || !client) {
            res.status(400);
            throw new Error('Please fill in all required fields');
        }

        // Verify client belongs to current user
        const existingClient = await Client.findOne({ _id: client, createdBy: req.user._id });
        if (!existingClient) {
            res.status(403);
            throw new Error('Client not found or access denied');
        }

        const project = await Project.create({
            name: useName,
            client,
            description: description || '',
            budget: budget || 0,
            hourlyRate: hourlyRate || 0,
            progress: progress || 0,
            startDate: startDate || '',
            dueDate: dueDate || deadline || '',
            priority: priority || 'Normal',
            status: status || 'To Do',
            tags: tags || [],
            createdBy: req.user._id
        });

        await Activity.create({
            action: 'created',
            taskName: useName,
            type: 'project',
            userRef: req.user._id,
            userName: req.user.fullName || req.user.name || 'Alex Rivera'
        });

        await Notification.create({
            type: 'project',
            title: 'New Project Created',
            message: `Project "${project.name}" was successfully created.`,
            user: req.user._id
        });

        const populatedProject = await Project.findById(project._id).populate('client');

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: populatedProject
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res, next) => {
    try {
        // The agreed budget originates from the accepted client request and is immutable
        // for the freelancer who works on the project.
        if (req.user.role === 'freelancer' && req.body.budget !== undefined) {
            return res.status(403).json({ success: false, message: 'Freelancers cannot modify the agreed project budget', data: null });
        }
        const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        const {
            name,
            title,
            client,
            description,
            budget,
            hourlyRate,
            startDate,
            dueDate,
            deadline,
            priority,
            status,
            progress,
            tags
        } = req.body;

        const changes = [];
        if (status !== undefined && status !== project.status) changes.push(`Status changed to ${status}`);
        if (priority !== undefined && priority !== project.priority) changes.push(`Priority changed to ${priority}`);
        if (progress !== undefined && progress !== project.progress) {
            changes.push(`Progress updated to ${progress}%`);
        }
        if (budget !== undefined && budget !== project.budget) {
            changes.push(`Budget updated to ₹${Number(budget).toLocaleString('en-IN')}`);
        }

        if (name !== undefined) project.name = name;
        if (title !== undefined) project.name = title;
        if (client !== undefined) {
            const existingClient = await Client.findOne({ _id: client, createdBy: req.user._id });
            if (!existingClient) {
                res.status(403);
                throw new Error('Client not found or access denied');
            }
            project.client = client;
        }
        if (description !== undefined) project.description = description;
        if (budget !== undefined) project.budget = budget;
        if (hourlyRate !== undefined) project.hourlyRate = hourlyRate;
        if (startDate !== undefined) project.startDate = startDate;
        if (dueDate !== undefined) project.dueDate = dueDate;
        if (deadline !== undefined) project.dueDate = deadline;
        if (priority !== undefined) project.priority = priority;
        if (status !== undefined) project.status = status;
        if (progress !== undefined) project.progress = progress;
        if (tags !== undefined) project.tags = tags;

        const updated = await project.save();

        if (changes.length > 0) {
            await Activity.create({
                action: changes.join(', '),
                taskName: project.name,
                type: 'project',
                userRef: req.user._id,
                userName: req.user.fullName || req.user.name || 'Alex Rivera'
            });

            await Notification.create({
                type: 'project',
                title: 'Project Updated',
                message: `Project "${project.name}" updates: ${changes.join(', ')}.`,
                user: req.user._id
            });
        }

        const populatedProject = await Project.findById(updated._id).populate('client');

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: populatedProject
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        // Cascade delete associated tasks
        await Task.deleteMany({ projectId: req.params.id });

        await Activity.create({
            action: 'deleted',
            taskName: project.name,
            type: 'project',
            userRef: req.user._id,
            userName: req.user.fullName || req.user.name || 'Alex Rivera'
        });

        res.json({
            success: true,
            message: 'Project deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
export const addProjectComment = async (req, res, next) => {
    try {
        const text = req.body.text || req.body.content;
        if (!text) {
            res.status(400);
            throw new Error('Comment text is required');
        }

        const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        const comment = await Comment.create({
            content: text,
            projectId: req.params.id,
            createdBy: req.user._id,
            userName: req.user.fullName || 'Alex Rivera'
        });

        await Activity.create({
            action: `commented on`,
            taskName: project.name,
            type: 'project',
            userRef: req.user._id,
            userName: req.user.fullName || 'Alex Rivera'
        });

        await Notification.create({
            type: 'project',
            title: 'New Project Comment',
            message: `A comment was added to project "${project.name}".`,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for project
// @route   GET /api/projects/:id/comments
// @access  Private
export const getProjectComments = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        const comments = await Comment.find({ projectId: req.params.id, createdBy: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Comments retrieved successfully',
            data: comments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment from project
// @route   DELETE /api/projects/:id/comments/:commentId
// @access  Private
export const deleteProjectComment = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        const comment = await Comment.findOne({ _id: req.params.commentId, projectId: req.params.id, createdBy: req.user._id });
        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        await Comment.deleteOne({ _id: req.params.commentId });

        res.json({
            success: true,
            message: 'Comment deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
