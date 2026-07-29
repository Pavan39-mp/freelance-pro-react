import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import File from '../models/File.js';
import fs from 'fs';
import path from 'path';

// Helper to populate comments and files dynamically
const populateTaskCommentsAndAttachments = async (tasksOrTask) => {
    if (!tasksOrTask) return tasksOrTask;
    const isArray = Array.isArray(tasksOrTask);
    const tasks = isArray ? tasksOrTask : [tasksOrTask];
    if (tasks.length === 0) return tasksOrTask;

    const taskIds = tasks.map(t => t._id);

    // Fetch comments
    const comments = await Comment.find({ taskId: { $in: taskIds } }).sort({ createdAt: -1 });
    const commentsGrouped = comments.reduce((acc, c) => {
        const taskIdStr = c.taskId.toString();
        acc[taskIdStr] = acc[taskIdStr] || [];
        acc[taskIdStr].push({
            id: c._id.toString(),
            user: c.userName,
            text: c.content,
            date: c.createdAt
        });
        return acc;
    }, {});

    // Fetch attachments
    const files = await File.find({ taskId: { $in: taskIds } }).sort({ createdAt: -1 });
    const filesGrouped = files.reduce((acc, f) => {
        const taskIdStr = f.taskId.toString();
        acc[taskIdStr] = acc[taskIdStr] || [];
        acc[taskIdStr].push({
            id: f._id.toString(),
            fileName: f.originalName,
            size: (f.size / 1024).toFixed(1) + ' KB',
            date: f.createdAt,
            url: f.url
        });
        return acc;
    }, {});

    const enriched = tasks.map(t => {
        const taskObj = t.toObject ? t.toObject() : t;
        const idStr = (t._id || t.id).toString();
        taskObj.comments = commentsGrouped[idStr] || [];
        taskObj.attachments = filesGrouped[idStr] || [];
        return taskObj;
    });

    return isArray ? enriched : enriched[0];
};

// Helper to update project progress whenever tasks change
const updateProjectProgress = async (projectId) => {
    try {
        const tasks = await Task.find({ projectId });
        const progress = tasks.length > 0
            ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
            : 0;
        await Project.findByIdAndUpdate(projectId, { progress });
    } catch (err) {
        console.error('Error updating project progress cascading:', err.message);
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
    try {
        const { search, status, priority, projectId, page, limit, sortBy, sortOrder, paginate } = req.query;
        let query = {};

        if (req.user.role === 'client') {
            const projects = await Project.find({ platformClient: req.user._id }, '_id');
            const projectIds = projects.map(p => p._id);
            query.projectId = { $in: projectIds };
        } else {
            query.createdBy = req.user._id;
        }

        // Filters
        if (status) {
            if (status === 'Overdue') {
                query.deadline = { $lt: new Date() };
                query.status = { $ne: 'Completed' };
            } else if (status === 'Pending') {
                query.status = { $in: ['To Do', 'In Progress', 'On Hold'] };
                query.deadline = { $not: { $lt: new Date() } };
            } else {
                const statusArray = status.split(',');
                if (statusArray.length > 1) {
                    query.status = { $in: statusArray };
                } else {
                    query.status = status;
                }
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
        if (projectId) {
            query.projectId = projectId;
        }

        // Search
        const safeSearch = typeof search === 'string' ? search : '';
        if (safeSearch) {
            const escapedSearch = safeSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            // Find projects matching search
            const projectMatch = {
                name: { $regex: escapedSearch, $options: 'i' }
            };

            if (req.user.role === 'client') {
                projectMatch.platformClient = req.user._id;
            } else {
                projectMatch.createdBy = req.user._id;
            }

            const matchingProjects = await Project.find(projectMatch);
            const pIds = matchingProjects.map(p => p._id);

            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
                { status: { $regex: escapedSearch, $options: 'i' } },
                { priority: { $regex: escapedSearch, $options: 'i' } },
                { projectId: { $in: pIds } }
            ];
        }

        const sortField = sortBy === 'name' ? 'title' : (sortBy === 'deadline' ? 'deadline' : (sortBy || 'createdAt'));
        const order = sortOrder === 'asc' ? 1 : -1;
        const sortQuery = { [sortField]: order };

        const mustPaginate = paginate === 'true' || page !== undefined;
        let tasks;
        let totalCount = 0;
        let totalPages = 1;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (mustPaginate) {
            totalCount = await Task.countDocuments(query);
            totalPages = Math.ceil(totalCount / limitNum);
            tasks = await Task.find(query)
                .populate({
                    path: 'projectId',
                    populate: [
                        { path: 'client' },
                        { path: 'platformClient', select: 'fullName email avatar company phone' }
                    ]
                })
                .sort(sortQuery)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);

            const enrichedTasks = await populateTaskCommentsAndAttachments(tasks);

            res.json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: {
                    items: enrichedTasks,
                    totalCount,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            });
        } else {
            tasks = await Task.find(query)
                .populate({
                    path: 'projectId',
                    populate: [
                        { path: 'client' },
                        { path: 'platformClient', select: 'fullName email avatar company phone' }
                    ]
                })
                .sort(sortQuery);

            const enrichedTasks = await populateTaskCommentsAndAttachments(tasks);

            res.json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: enrichedTasks
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const addTask = async (req, res, next) => {
    try {
        const { title, projectId, priority, status, estimatedHours, deadline, description } = req.body;

        if (!title || !projectId) {
            res.status(400);
            throw new Error('Please fill in all required fields');
        }

        // Verify project belongs to current user
        const existingProject = await Project.findOne({ _id: projectId, createdBy: req.user._id });
        if (!existingProject) {
            res.status(403);
            throw new Error('Project not found or access denied');
        }

        const task = await Task.create({
            title,
            projectId,
            priority: priority || 'Normal',
            status: status || 'To Do',
            estimatedHours: estimatedHours || 10,
            deadline,
            description,
            createdBy: req.user._id
        });

        // Fetch populated details for notification / logging
        const populatedProject = await Project.findById(projectId);

        // Create Notification and Activity
        await Notification.create({
            type: 'task',
            title: 'New Task Created',
            message: `Task "${title}" was created for project ${populatedProject ? populatedProject.name : ''}.`,
            user: req.user._id
        });

        await Activity.create({
            action: 'created',
            taskName: title,
            type: 'task',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        // Update Project Progress
        await updateProjectProgress(projectId);

        const populatedTask = await Task.findById(task._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        task.title = req.body.title || task.title;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;
        task.estimatedHours = req.body.estimatedHours !== undefined ? req.body.estimatedHours : task.estimatedHours;
        task.deadline = req.body.deadline || task.deadline;
        task.description = req.body.description !== undefined ? req.body.description : task.description;

        const updated = await task.save();
        await updateProjectProgress(task.projectId);

        const populatedTask = await Task.findById(updated._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a task progress
// @route   PUT /api/tasks/:id/progress
// @access  Private
export const updateTaskProgress = async (req, res, next) => {
    try {
        const { newProgress, hoursWorked, summary, isBlocked, blockReason } = req.body;
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const prevProgress = task.progress;
        const historyEntry = {
            date: new Date(),
            prevProgress,
            newProgress,
            hoursWorked: hoursWorked || 0,
            summary: summary || '',
            isBlocked: isBlocked || false,
            blockReason: blockReason || '',
            user: req.user.fullName
        };

        let newStatus = task.status;
        if (newProgress === 100) newStatus = "Completed";
        else if (newProgress > 0) newStatus = "In Progress";
        else newStatus = "To Do";

        if (isBlocked) newStatus = "On Hold";

        task.progress = newProgress;
        task.workedHours = (task.workedHours || 0) + (hoursWorked || 0);
        task.status = newStatus;
        task.isBlocked = isBlocked || false;
        task.blockReason = blockReason || '';
        task.progressHistory.unshift(historyEntry);

        const updated = await task.save();

        // Create Notification if Completed
        if (prevProgress !== 100 && newProgress === 100) {
            await Notification.create({
                type: 'task',
                title: 'Task Completed',
                message: `Task "${task.title}" has reached 100% completion!`,
                user: req.user._id
            });
        }

        // Add activity
        await Activity.create({
            action: `updated (${prevProgress}% → ${newProgress}%)`,
            taskName: task.title,
            type: 'task',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        await updateProjectProgress(task.projectId);

        const populatedTask = await Task.findById(updated._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Task progress updated successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Undo last task progress modification
// @route   POST /api/tasks/:id/undo
// @access  Private
export const undoLastProgress = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task || task.progressHistory.length === 0) {
            res.status(400);
            throw new Error('Task not found or no progress history');
        }

        const lastEntry = task.progressHistory.shift();

        let newStatus = task.status;
        if (lastEntry.prevProgress === 100) newStatus = 'Completed';
        else if (lastEntry.prevProgress > 0) newStatus = 'In Progress';
        else if (lastEntry.prevProgress === 0) newStatus = 'To Do';

        task.progress = lastEntry.prevProgress;
        task.workedHours = Math.max(0, (task.workedHours || 0) - lastEntry.hoursWorked);
        task.status = newStatus;
        task.isBlocked = false;
        task.blockReason = '';

        const updated = await task.save();

        await Activity.create({
            action: `reverted to ${lastEntry.prevProgress}%`,
            taskName: task.title,
            type: 'task',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        await updateProjectProgress(task.projectId);

        const populatedTask = await Task.findById(updated._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Task progress reverted successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const projectId = task.projectId;
        await Task.deleteOne({ _id: req.params.id });
        await updateProjectProgress(projectId);

        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        await Comment.create({
            content: text,
            taskId: req.params.id,
            projectId: task.projectId,
            createdBy: req.user._id,
            userName: req.user.fullName || 'Alex Rivera'
        });

        await Activity.create({
            action: `commented on`,
            taskName: task.title,
            type: 'task',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        await Notification.create({
            type: 'task',
            title: 'New Task Comment',
            message: `A comment was added to task "${task.title}".`,
            user: req.user._id
        });

        const populatedTask = await Task.findById(task._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Edit comment
// @route   PUT /api/tasks/:id/comments/:commentId
// @access  Private
export const editComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const comment = await Comment.findOne({ _id: req.params.commentId, taskId: req.params.id, createdBy: req.user._id });
        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        comment.content = text;
        await comment.save();

        const populatedTask = await Task.findById(task._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete comment
// @route   DELETE /api/tasks/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const comment = await Comment.findOne({ _id: req.params.commentId, taskId: req.params.id, createdBy: req.user._id });
        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        await Comment.deleteOne({ _id: req.params.commentId });

        const populatedTask = await Task.findById(task._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Comment deleted successfully',
            data: finalTask
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
export const addAttachment = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(404);
            throw new Error('Task not found');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please select a file to upload');
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        await File.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
            projectId: task.projectId,
            taskId: task._id,
            uploadedBy: req.user._id,
            uploaderName: req.user.fullName
        });

        await Activity.create({
            action: `uploaded file to`,
            taskName: task.title,
            type: 'task',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        // Also add project level activity
        await Activity.create({
            action: 'uploaded file',
            taskName: req.file.originalname,
            type: 'project',
            userRef: req.user._id,
            userName: req.user.fullName
        });

        await Notification.create({
            type: 'task',
            title: 'New Task Attachment',
            message: `File "${req.file.originalname}" was uploaded to task "${task.title}".`,
            user: req.user._id
        });

        const populatedTask = await Task.findById(task._id).populate({
            path: 'projectId',
            populate: { path: 'client' }
        });

        const finalTask = await populateTaskCommentsAndAttachments(populatedTask);

        res.json({
            success: true,
            message: 'Attachment added successfully',
            data: finalTask
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};
