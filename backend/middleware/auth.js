import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const normalizeRole = (role) => {
    const normalized = String(role || '').trim().toLowerCase();
    return ['client', 'freelancer'].includes(normalized) ? normalized : null;
};

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user and attach to request
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found',
                    data: null
                });
            }

            req.user.role = normalizeRole(req.user.role);
            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized, user has an invalid role',
                    data: null
                });
            }

            next();
        } catch (error) {
            console.error('Authentication Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
                data: null
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
            data: null
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this resource`,
                data: null
            });
        }
        next();
    };
};
