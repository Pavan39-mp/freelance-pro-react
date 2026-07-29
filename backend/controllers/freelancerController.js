import mongoose from 'mongoose';
import User from '../models/User.js';
import {
    isAvailabilityType,
    isExperienceLevel,
    normalizeFreelancerRecord,
    normalizeLegacyFreelancers
} from '../utils/freelancerProfile.js';

const PUBLIC_FIELDS = [
    '_id', 'fullName', 'email', 'avatar', 'role', 'isPublicProfile', 'title', 'skills', 'services', 'location', 'bio', 'portfolio',
    'experienceLevel', 'experienceYears', 'availabilityType', 'availableHoursPerWeek', 'createdAt'
].join(' ');

const publicFreelancer = (user) => {
    const value = user.toObject ? user.toObject() : user;
    const normalized = normalizeFreelancerRecord(value);
    return {
        _id: value._id,
        name: value.fullName,
        email: value.email,
        profilePicture: value.avatar,
        title: value.title,
        skills: value.skills,
        services: value.services,
        location: value.location,
        bio: value.bio,
        portfolio: value.portfolio,
        ...normalized,
        createdAt: value.createdAt
    };
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all public freelancers with search, filter, and pagination
// @route   GET /api/freelancers
// @access  Private
export const getFreelancers = async (req, res, next) => {
    try {
        await normalizeLegacyFreelancers(User);
        const { search, skills, availability, experienceLevel, sort = 'newest', page = 1, limit = 10 } = req.query;

        if (availability && !isAvailabilityType(availability)) {
            return res.status(400).json({ success: false, message: 'Invalid availability filter.', data: null });
        }
        if (experienceLevel && !isExperienceLevel(experienceLevel)) {
            return res.status(400).json({ success: false, message: 'Invalid experience filter.', data: null });
        }
        if (!['newest', 'name', 'experience'].includes(sort)) {
            return res.status(400).json({ success: false, message: 'Invalid freelancer sort.', data: null });
        }

        const query = { role: 'freelancer', isPublicProfile: true };
        if (search) {
            const pattern = escapeRegex(search);
            query.$or = [
                { fullName: { $regex: pattern, $options: 'i' } },
                { skills: { $regex: pattern, $options: 'i' } },
                { services: { $regex: pattern, $options: 'i' } },
                { title: { $regex: pattern, $options: 'i' } }
            ];
        }
        if (skills) query.skills = { $regex: escapeRegex(skills), $options: 'i' };
        if (availability) query.availabilityType = availability;
        if (experienceLevel) query.experienceLevel = experienceLevel;

        const sortQuery = sort === 'name'
            ? { fullName: 1, _id: 1 }
            : sort === 'experience'
                ? { experienceYears: -1, createdAt: -1, _id: 1 }
                : { createdAt: -1, _id: 1 };
        const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 10));
        const totalCount = await User.countDocuments(query);

        let findQuery = User.find(query).select(PUBLIC_FIELDS).sort(sortQuery).skip((pageNum - 1) * limitNum).limit(limitNum);
        if (sort === 'name') findQuery = findQuery.collation({ locale: 'en', strength: 2 });
        const freelancers = await findQuery;

        return res.json({
            success: true,
            data: freelancers.map(publicFreelancer),
            page: pageNum,
            totalPages: Math.max(1, Math.ceil(totalCount / limitNum)),
            totalCount
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public freelancer profile by ID
// @route   GET /api/freelancers/:id
// @access  Private (Client or Freelancer)
export const getFreelancerProfile = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid freelancer ID', data: null });
        }
        await normalizeLegacyFreelancers(User, { _id: new mongoose.Types.ObjectId(req.params.id) });
        const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Freelancer not found', data: null });
        }
        if (user.role !== 'freelancer') {
            return res.status(400).json({ success: false, message: 'Requested user is not a freelancer', data: null });
        }
        if (!user.isPublicProfile) {
            return res.status(403).json({ success: false, message: 'This freelancer profile is private', data: null });
        }
        return res.json({
            success: true,
            message: 'Freelancer profile retrieved successfully',
            data: publicFreelancer(user)
        });
    } catch (error) {
        next(error);
    }
};
