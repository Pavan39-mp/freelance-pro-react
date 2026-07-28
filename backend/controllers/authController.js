import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const normalizeRole = (role) => {
    const normalized = String(role || '').trim().toLowerCase();
    return ['client', 'freelancer'].includes(normalized) ? normalized : null;
};

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password, role } = req.body;

        if (!fullName || !email || !password) {
            res.status(400);
            throw new Error('Please enter all fields');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const userRole = normalizeRole(role) || 'freelancer';

        const user = await User.create({
            fullName,
            email,
            password,
            role: userRole,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: normalizeRole(user.role),
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: normalizeRole(user.role),
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                message: 'User profile retrieved successfully',
                data: {
                    ...user.toObject(),
                    role: normalizeRole(user.role),
                },
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile / settings
// @route   PUT /api/auth/me
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.company = req.body.company !== undefined ? req.body.company : user.company;
            user.avatar = req.body.avatar || user.avatar;
            user.location = req.body.location !== undefined ? req.body.location : user.location;
            user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
            user.isPublicProfile = req.body.isPublicProfile !== undefined ? req.body.isPublicProfile : user.isPublicProfile;
            user.services = req.body.services !== undefined ? req.body.services : user.services;
            user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
            user.portfolio = req.body.portfolio !== undefined ? req.body.portfolio : user.portfolio;
            user.availability = req.body.availability !== undefined ? req.body.availability : user.availability;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.title = req.body.title !== undefined ? req.body.title : user.title;

            if (req.body.password) {
                const { currentPassword } = req.body;
                if (!currentPassword) {
                    res.status(400);
                    throw new Error('Current password is required to change password');
                }

                const isMatch = await user.matchPassword(currentPassword);
                if (!isMatch) {
                    res.status(401);
                    throw new Error('Current password is incorrect');
                }

                user.password = req.body.password;
            }

            if (req.body.themePreference) {
                user.themePreference = req.body.themePreference;
            }

            if (req.body.notificationPreferences) {
                user.notificationPreferences = {
                    ...user.notificationPreferences.toObject(),
                    ...req.body.notificationPreferences,
                };
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
        data: null,
    });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            throw new Error('User with this email not found');
        }

        // In a production app, generate recovery token and send email.
        // For now, we simulate this and return a simulated success.
        console.log(`[BACKEND EMAIL SIMULATION] Password reset requested for: ${email}`);

        res.json({
            success: true,
            message: 'Password reset link sent to your email',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            throw new Error('User with this email not found');
        }

        user.password = password;
        await user.save();

        res.json({
            success: true,
            message: 'Password has been reset successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
