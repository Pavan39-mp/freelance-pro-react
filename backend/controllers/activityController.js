import Activity from '../models/Activity.js';

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res, next) => {
    try {
        const activities = await Activity.find({ userRef: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // limit to recent 50

        res.json({
            success: true,
            message: 'Recent activities retrieved successfully',
            data: activities
        });
    } catch (error) {
        next(error);
    }
};
