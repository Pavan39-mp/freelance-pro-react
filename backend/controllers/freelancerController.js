import User from '../models/User.js';

// @desc    Get all public freelancers with search, filter, and pagination
// @route   GET /api/freelancers
// @access  Private
export const getFreelancers = async (req, res, next) => {
    try {
        const { search, skills, availability, experience, sort, page = 1, limit = 10 } = req.query;

        // Base query: Only active freelancers with public profiles
        const query = {
            role: 'freelancer',
            isPublicProfile: true
        };

        // Search logic (name, skills, services)
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } },
                { services: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } }
            ];
        }

        // Exact match filters (if provided)
        if (skills) query.skills = { $regex: skills, $options: 'i' };
        if (availability) query.availability = { $regex: availability, $options: 'i' };
        if (experience) query.experience = { $regex: experience, $options: 'i' };

        // Sorting
        let sortObj = { createdAt: -1 }; // default: newest
        if (sort === 'experience') sortObj = { experience: -1 };
        if (sort === 'name') sortObj = { fullName: 1 };

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const totalCount = await User.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limitNum);

        const freelancers = await User.find(query)
            .select('-password')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: freelancers,
            page: pageNum,
            totalPages,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching freelancers:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            data: null
        });
    }
};

// @desc    Get public freelancer profile by ID
// @route   GET /api/freelancers/:id
// @access  Private (Client or Freelancer)
export const getFreelancerProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Freelancer not found',
                data: null
            });
        }

        if (user.role !== 'freelancer') {
            return res.status(400).json({
                success: false,
                message: 'Requested user is not a freelancer',
                data: null
            });
        }

        if (!user.isPublicProfile) {
            return res.status(403).json({
                success: false,
                message: 'This freelancer profile is private',
                data: null
            });
        }

        res.json({
            success: true,
            message: 'Freelancer profile retrieved successfully',
            data: user
        });
    } catch (error) {
        console.error('Error fetching freelancer profile:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            data: null
        });
    }
};
