import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';

// @desc    Global search
// @route   GET /api/search
// @access  Private
export const globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;
        const safeQ = typeof q === 'string' ? q : '';
        if (!safeQ) {
            return res.json({
                success: true,
                message: 'Empty query provided',
                data: { clients: [], projects: [], tasks: [], meetings: [] }
            });
        }

        const userId = req.user._id;
        const escapedQ = safeQ.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = { $regex: escapedQ, $options: 'i' };

        // 1. Clients: fullName, email, company
        const clients = await Client.find({
            createdBy: userId,
            $or: [
                { fullName: regex },
                { email: regex },
                { company: regex }
            ]
        }).limit(10);

        const clientIds = clients.map(c => c._id);

        // 2. Projects: name, status, or matching client reference
        const projects = await Project.find({
            createdBy: userId,
            $or: [
                { name: regex },
                { status: regex },
                { client: { $in: clientIds } }
            ]
        }).populate('client').limit(10);

        const projectIds = projects.map(p => p._id);

        // 3. Tasks: title, status, or matching project reference
        const tasks = await Task.find({
            createdBy: userId,
            $or: [
                { title: regex },
                { status: regex },
                { projectId: { $in: projectIds } }
            ]
        }).populate('projectId').limit(10);

        // 4. Meetings: title, descriptions or matching user
        const meetings = await Meeting.find({
            user: userId,
            $or: [
                { title: regex },
                { description: regex }
            ]
        }).limit(10);

        res.json({
            success: true,
            message: 'Global search completed successfully',
            data: {
                clients: clients.map(c => ({
                    ...c.toObject(),
                    id: c._id,
                    name: c.fullName
                })),
                projects: projects.map(p => ({
                    ...p.toObject(),
                    id: p._id,
                    title: p.name,
                    clientName: p.client?.fullName || p.client?.name || ''
                })),
                tasks: tasks.map(t => ({
                    ...t.toObject(),
                    id: t._id,
                    project: t.projectId?.name || ''
                })),
                meetings: meetings.map(m => ({
                    ...m.toObject(),
                    id: m._id
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};
