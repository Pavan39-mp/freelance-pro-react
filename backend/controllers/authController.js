import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import {
    isAvailabilityType,
    isExperienceLevel,
    normalizeFreelancerRecord,
    normalizeLegacyFreelancers,
    toProfileNumber
} from '../utils/freelancerProfile.js';

const normalizeRole = (role) => {
    const normalized = String(role || '').trim().toLowerCase();
    return ['client', 'freelancer'].includes(normalized) ? normalized : null;
};

const isStrongPassword = (password) =>
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const publicUser = (user) => {
    const object = user.toObject ? user.toObject() : user;
    const safeUser = { ...object };
    delete safeUser.password;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;
    delete safeUser.__v;
    delete safeUser.experience;
    delete safeUser.availability;
    if (normalizeRole(safeUser.role) === 'freelancer') {
        Object.assign(safeUser, normalizeFreelancerRecord(safeUser));
    }
    return { ...safeUser, role: normalizeRole(safeUser.role) };
};

const FREELANCER_FIELDS = [
    'skills',
    'services',
    'portfolio',
    'title',
    'isPublicProfile',
    'experienceLevel',
    'experienceYears',
    'availabilityType',
    'availableHoursPerWeek'
];

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
        const fullName = String(req.body.fullName || '').trim();
        const { password } = req.body;
        const email = String(req.body.email || '').trim().toLowerCase();
        const userRole = normalizeRole(req.body.role);

        if (!fullName) {
            return res.status(400).json({ success: false, message: 'Full name is required.', data: null });
        }
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.', data: null });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required.', data: null });
        }
        if (!userRole) {
            return res.status(400).json({ success: false, message: 'Role must be client or freelancer.', data: null });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.', data: null });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
                data: null
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.', data: null });
        }

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
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.', data: null });
        }
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;
        const requestedRole = normalizeRole(req.body.role);

        if (!email || !password || !requestedRole) {
            return res.status(400).json({ success: false, message: 'Email, password, and a valid role are required.', data: null });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const actualRole = normalizeRole(user.role);
            if (!actualRole) {
                return res.status(403).json({ success: false, message: 'This account has an invalid role.', data: null });
            }
            if (actualRole !== requestedRole) {
                const actualLabel = actualRole === 'client' ? 'Client' : 'Freelancer';
                return res.status(403).json({
                    success: false,
                    message: `Role mismatch: this account is registered as a ${actualLabel}.`,
                    data: null
                });
            }
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: actualRole,
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
        if (req.user.role === 'freelancer') {
            await normalizeLegacyFreelancers(User, { _id: req.user._id });
        }
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                message: 'User profile retrieved successfully',
                data: publicUser(user),
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
        const requestedFreelancerFields = FREELANCER_FIELDS.filter((field) => req.body[field] !== undefined);
        if (requestedFreelancerFields.length && req.user.role !== 'freelancer') {
            return res.status(403).json({ success: false, message: 'Clients cannot update freelancer profile fields.', data: null });
        }
        if (req.user.role === 'freelancer') {
            await normalizeLegacyFreelancers(User, { _id: req.user._id });
        }
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.company = req.body.company !== undefined ? req.body.company : user.company;
            user.avatar = req.body.avatar || user.avatar;
            user.location = req.body.location !== undefined ? req.body.location : user.location;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

            if (req.user.role === 'freelancer') {
                user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
                user.isPublicProfile = req.body.isPublicProfile !== undefined ? req.body.isPublicProfile : user.isPublicProfile;
                user.services = req.body.services !== undefined ? req.body.services : user.services;
                user.portfolio = req.body.portfolio !== undefined ? req.body.portfolio : user.portfolio;
                user.title = req.body.title !== undefined ? req.body.title : user.title;
                if (req.body.experienceLevel !== undefined) {
                    if (!isExperienceLevel(req.body.experienceLevel)) {
                        return res.status(400).json({ success: false, message: 'Invalid experience level.', data: null });
                    }
                    user.experienceLevel = req.body.experienceLevel;
                }
                if (req.body.availabilityType !== undefined) {
                    if (!isAvailabilityType(req.body.availabilityType)) {
                        return res.status(400).json({ success: false, message: 'Invalid availability type.', data: null });
                    }
                    user.availabilityType = req.body.availabilityType;
                }
                if (req.body.experienceYears !== undefined) {
                    const years = toProfileNumber(req.body.experienceYears, Number.NaN);
                    if (!Number.isFinite(years) || years < 0) {
                        return res.status(400).json({ success: false, message: 'Years of experience must be 0 or greater.', data: null });
                    }
                    user.experienceYears = years;
                }
                if (req.body.availableHoursPerWeek !== undefined) {
                    const hours = toProfileNumber(req.body.availableHoursPerWeek, Number.NaN);
                    if (!Number.isFinite(hours) || hours < 0 || hours > 168) {
                        return res.status(400).json({ success: false, message: 'Available hours per week must be between 0 and 168.', data: null });
                    }
                    user.availableHoursPerWeek = hours;
                }
            }

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

                if (!isStrongPassword(req.body.password)) {
                    return res.status(400).json({
                        success: false,
                        message: 'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
                        data: null
                    });
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
                data: publicUser(updatedUser),
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
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.', data: null });
        }

        const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');

        // Do not reveal whether an account exists for a supplied email address.
        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save({ validateBeforeSave: false });

            const configuredFrontendUrl = String(process.env.FRONTEND_URL || '').trim();
            const frontendUrl = configuredFrontendUrl || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
            const resetUrl = frontendUrl
                ? `${frontendUrl.replace(/\/+$/, '')}/reset-password/${rawToken}`
                : '';
            const safeName = escapeHtml(user.fullName || 'there');
            const emailResult = resetUrl
                ? await sendEmail({
                    to: user.email,
                    subject: 'Reset your FreelancePro password',
                    text: `Hello ${user.fullName || 'there'},\n\nUse this link to reset your FreelancePro password: ${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this change, you can ignore this email.`,
                    html: `<p>Hello ${safeName},</p><p>We received a request to reset your FreelancePro password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes.</p><p>If you did not request this change, you can ignore this email.</p>`
                })
                : { success: false, code: 'FRONTEND_URL_NOT_CONFIGURED' };

            if (!emailResult.success) {
                console.error(`Password-reset email delivery failed: ${emailResult.code || 'UNKNOWN_ERROR'}`);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save({ validateBeforeSave: false });
                return res.status(503).json({
                    success: false,
                    message: 'Password reset email is temporarily unavailable. Please try again later.',
                    data: null
                });
            }
        }

        res.json({
            success: true,
            message: 'If an account exists for that email, a password reset link has been sent.',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.', data: null });
        }
        if (!token || !isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Provide a valid reset token and a strong password.',
                data: null
            });
        }
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: new Date() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.', data: null });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
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
