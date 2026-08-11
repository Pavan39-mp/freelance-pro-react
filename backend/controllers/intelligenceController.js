import mongoose from 'mongoose';
import Project from '../models/Project.js';
import {
    buildPortfolio,
    calculateProductivity,
    calculateProjectIntelligence,
    getOwnedClientReliability
} from '../services/intelligenceService.js';

export const getMyProductivity = async (req, res, next) => {
    try {
        const data = await calculateProductivity(req.user._id);
        res.json({ success: true, message: 'Productivity score calculated successfully', data });
    } catch (error) { next(error); }
};

export const getMyPortfolio = async (req, res, next) => {
    try {
        const data = await buildPortfolio(req.user._id);
        res.json({ success: true, message: 'Portfolio retrieved successfully', data });
    } catch (error) { next(error); }
};

export const getProjectIntelligence = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ success: false, message: 'Invalid project ID', data: null });
        }
        const project = await Project.findById(req.params.projectId).populate('client', 'fullName');
        if (!project) return res.status(404).json({ success: false, message: 'Project not found', data: null });
        const allowed = req.user.role === 'freelancer'
            ? String(project.createdBy) === String(req.user._id)
            : String(project.platformClient) === String(req.user._id);
        if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized to access project intelligence', data: null });
        const data = await calculateProjectIntelligence(project);
        return res.json({ success: true, message: 'Project intelligence calculated successfully', data });
    } catch (error) { next(error); }
};

export const getClientReliability = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.clientId)) {
            return res.status(400).json({ success: false, message: 'Invalid client ID', data: null });
        }
        const data = await getOwnedClientReliability(req.params.clientId, req.user);
        if (!data) return res.status(403).json({ success: false, message: 'Not authorized to access client reliability', data: null });
        return res.json({ success: true, message: 'Client reliability calculated successfully', data });
    } catch (error) { next(error); }
};
