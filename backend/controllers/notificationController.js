import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const populateNotification = (query) => query
    .populate('sender', 'fullName avatar')
    .populate({
        path: 'meeting',
        select: 'title client clientName clientUser project provider joinUrl date time timeZone duration agenda notes status freelancer',
        populate: [
            { path: 'freelancer', select: 'fullName avatar' },
            { path: 'clientUser', select: 'fullName avatar' }
        ]
    });

const checkUpcomingDeadlines = async (userId) => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const now = new Date();

        const isUpcoming = (dateValue) => {
            const date = new Date(dateValue);
            return !Number.isNaN(date.getTime()) && date >= now && date <= threeDaysFromNow;
        };

        // Project and task deadlines are stored as ISO-compatible strings.
        // Filter them as dates after retrieval instead of issuing an invalid
        // MongoDB date-range query against a String schema field.
        const upcomingProjects = (await Project.find({
            createdBy: userId,
            status: { $ne: 'Completed' }
        })).filter(project => isUpcoming(project.dueDate));

        for (const project of upcomingProjects) {
            const dateStr = new Date(project.dueDate).toDateString();
            const exists = await Notification.findOne({
                user: userId,
                type: 'project',
                title: 'Project Deadline Approaching',
                message: { $regex: new RegExp(project.name, 'i') }
            });

            if (!exists) {
                await Notification.create({
                    user: userId,
                    type: 'project',
                    title: 'Project Deadline Approaching',
                    message: `The project "${project.name}" is due on ${dateStr}.`
                });
            }
        }

        const upcomingTasks = (await Task.find({
            createdBy: userId,
            status: { $ne: 'Completed' }
        })).filter(task => isUpcoming(task.deadline));

        for (const task of upcomingTasks) {
            const dateStr = new Date(task.deadline).toDateString();
            const exists = await Notification.findOne({
                user: userId,
                type: 'task',
                title: 'Task Deadline Approaching',
                message: { $regex: new RegExp(task.title, 'i') }
            });

            if (!exists) {
                await Notification.create({
                    user: userId,
                    type: 'task',
                    title: 'Task Deadline Approaching',
                    message: `The task "${task.title}" is due on ${dateStr}.`
                });
            }
        }
    } catch (err) {
        console.error('Error auto-generating deadline notifications:', err.message);
    }
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
    try {
        await checkUpcomingDeadlines(req.user._id);

        const { search, page, limit, sortBy, sortOrder, paginate } = req.query;
        let query = { user: req.user._id };

        // Search
        const safeSearch = typeof search === 'string' ? search : '';
        if (safeSearch) {
            const escapedSearch = safeSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { message: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        const sortField = sortBy === 'name' ? 'title' : (sortBy || 'createdAt');
        const order = sortOrder === 'asc' ? 1 : -1;
        const sortQuery = { [sortField]: order };

        const mustPaginate = paginate === 'true' || page !== undefined;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (mustPaginate) {
            const totalCount = await Notification.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limitNum);
            const notifications = await populateNotification(Notification.find(query))
                .sort(sortQuery)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);

            res.json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: {
                    items: notifications,
                    totalCount,
                    page: pageNum,
                    limit: limitNum,
                    totalPages
                }
            });
        } else {
            const notifications = await populateNotification(Notification.find(query)).sort(sortQuery);
            res.json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: notifications
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id
// @access  Private
export const markNotificationRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }

        notification.read = true;
        await notification.save();
        const updated = await populateNotification(Notification.findById(notification._id));

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllNotificationsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });

        const notifications = await populateNotification(Notification.find({ user: req.user._id })).sort({ createdAt: -1 });
        res.json({
            success: true,
            message: 'All notifications marked as read',
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
