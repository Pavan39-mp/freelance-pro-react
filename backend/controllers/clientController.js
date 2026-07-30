import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import ProjectRequest from '../models/ProjectRequest.js';

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res, next) => {
    try {
        const { search, status, page, limit, sortBy, sortOrder, paginate } = req.query;
        const [acceptedRequests, acceptedProjects] = await Promise.all([
            ProjectRequest.find({
            freelancer: req.user._id,
            status: 'accepted'
            }),
            Project.find({ createdBy: req.user._id, platformClient: { $ne: null } }).select('platformClient')
        ]);

        const platformClientIds = [...new Set([
            ...acceptedRequests.map(request => request.client.toString()),
            ...acceptedProjects.filter(project => project.platformClient).map(project => project.platformClient.toString())
        ])];
        const platformUsers = await User.find({ _id: { $in: platformClientIds }, role: 'client' });

        const projectCounts = await Project.aggregate([
            { $match: { createdBy: req.user._id, platformClient: { $in: platformUsers.map(user => user._id) } } },
            { $group: { _id: '$platformClient', count: { $sum: 1 } } }
        ]);
        const projectCountByClient = new Map(projectCounts.map(entry => [entry._id.toString(), entry.count]));

        let connectedClients = platformUsers.map(user => ({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || '',
                company: user.company || '',
                location: user.location || '',
                status: 'Active',
                notes: 'Connected via Project Request',
                avatar: user.avatar || `https://i.pravatar.cc/150?u=${user._id}`,
                isPlatformClient: true,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                projectCount: projectCountByClient.get(user._id.toString()) || 0
            }));

        if (status && status !== 'All' && status !== 'Active') connectedClients = [];
        if (search) {
            const query = search.toLowerCase();
            connectedClients = connectedClients.filter(client => [client.fullName, client.company, client.email]
                .some(value => value?.toLowerCase().includes(query)));
        }
        connectedClients.sort((a, b) => {
            const direction = sortOrder === 'asc' ? 1 : -1;
            if (sortBy === 'name') return direction * a.fullName.localeCompare(b.fullName);
            return direction * (new Date(a.createdAt) - new Date(b.createdAt));
        });

        const mustPaginate = paginate === 'true' || page !== undefined;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const totalCount = connectedClients.length;
        const clientsWithProjectCount = mustPaginate
            ? connectedClients.slice((pageNum - 1) * limitNum, pageNum * limitNum)
            : connectedClients;

        if (mustPaginate) {
            res.json({
                success: true,
                message: 'Clients retrieved successfully',
                data: {
                    items: clientsWithProjectCount,
                    totalCount,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(totalCount / limitNum) || 1
                }
            });
        } else {
            res.json({
                success: true,
                message: 'Clients retrieved successfully',
                data: clientsWithProjectCount
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req, res, next) => {
    try {
        const {
            name,
            fullName,
            email,
            phone,
            company,
            status,
            industry,
            notes,
            website,
            country,
            priority,
            avatar
        } = req.body;

        const useFullName = fullName || name;
        if (!useFullName || !email) {
            res.status(400);
            throw new Error('Please provide name and email');
        }

        const client = await Client.create({
            fullName: useFullName,
            email,
            phone: phone || '',
            company: company || '',
            status: status || 'Active',
            industry: industry || '',
            notes: notes || '',
            website: website || '',
            country: country || '',
            priority: priority || 'Normal',
            avatar: avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
            createdBy: req.user._id
        });

        await Notification.create({
            type: 'client',
            title: 'New Client Created',
            message: `Client "${client.fullName}" was created successfully.`,
            user: req.user._id
        });

        await Activity.create({
            action: 'created',
            taskName: client.fullName,
            type: 'client',
            userRef: req.user._id,
            userName: req.user.fullName || req.user.name || 'Alex Rivera'
        });

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: client
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req, res, next) => {
    try {
        if (req.user.role === 'freelancer') {
            return res.status(403).json({
                success: false,
                message: 'Freelancers are not permitted to edit client details.',
                data: null
            });
        }

        const client = await Client.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }

        const {
            name,
            fullName,
            email,
            phone,
            company,
            status,
            industry,
            notes,
            website,
            country,
            priority,
            avatar,
            archived
        } = req.body;

        if (fullName !== undefined) client.fullName = fullName;
        if (name !== undefined) client.fullName = name;
        if (email !== undefined) client.email = email;
        if (phone !== undefined) client.phone = phone;
        if (company !== undefined) client.company = company;
        if (status !== undefined) client.status = status;
        if (industry !== undefined) client.industry = industry;
        if (notes !== undefined) client.notes = notes;
        if (website !== undefined) client.website = website;
        if (country !== undefined) client.country = country;
        if (priority !== undefined) client.priority = priority;
        if (avatar !== undefined) client.avatar = avatar;
        if (archived !== undefined) client.archived = archived;

        const updated = await client.save();

        await Activity.create({
            action: 'updated',
            taskName: updated.fullName,
            type: 'client',
            userRef: req.user._id,
            userName: req.user.fullName || req.user.name || 'Alex Rivera'
        });

        res.json({
            success: true,
            message: 'Client updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req, res, next) => {
    try {
        const client = await Client.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }

        res.json({
            success: true,
            message: 'Client deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Archive a client
// @route   PATCH /api/clients/:id/archive
// @access  Private
export const archiveClient = async (req, res, next) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            { archived: true },
            { new: true }
        );
        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }
        res.json({
            success: true,
            message: 'Client archived successfully',
            data: client
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Unarchive a client
// @route   PATCH /api/clients/:id/unarchive
// @access  Private
export const unarchiveClient = async (req, res, next) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            { archived: false },
            { new: true }
        );
        if (!client) {
            res.status(404);
            throw new Error('Client not found');
        }
        res.json({
            success: true,
            message: 'Client unarchived successfully',
            data: client
        });
    } catch (error) {
        next(error);
    }
};
