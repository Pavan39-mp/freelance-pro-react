import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import timerRoutes from './routes/timerRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import projectRequestRoutes from './routes/projectRequestRoutes.js';
import projectProposalRoutes from './routes/projectProposalRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Env loaded via import 'dotenv/config' above


// Create Express App
const app = express();

// Security and utility Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// CORS configuration to allow local Vite frontend
app.use(cors({
    origin: function (origin, callback) {
        // Accept all local development origins seamlessly
        if (!origin) return callback(null, true);

        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            // For other origins, fail gracefully so it doesn't crash the Node server
            callback(null, false);
        }
    },
    credentials: true
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate limiting (simple limiter)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Keep the HTTP API reachable during a temporary database outage. Database-backed
// routes return a clear retryable response instead of the process exiting and
// causing clients to receive ERR_CONNECTION_REFUSED.
app.use('/api', (req, res, next) => {
    if (req.path === '/health' || mongoose.connection.readyState === 1) return next();
    return res.status(503).json({
        success: false,
        message: 'Database connection is temporarily unavailable. Please try again shortly.'
    });
});

// Rate limiting for sensitive authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 30, // limit each IP to 30 requests per 15 minutes for auth endpoints
    message: {
        success: false,
        message: 'Too many login or registration attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/project-requests', projectRequestRoutes);
app.use('/api/project-proposals', projectProposalRoutes);
app.use('/api/messages', messageRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Base route for server status
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FreelancePro MERN Backend API is running...',
        data: null
    });
});

// Error handling middleware
app.use(errorHandler);

// Boot server
const PORT = process.env.PORT || 5001;

const reconnectDatabase = async () => {
    const connected = await connectDB();
    if (!connected) {
        console.log('Retrying MongoDB connection in 10 seconds...');
        setTimeout(reconnectDatabase, 10000);
    }
};

const boot = () => {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        reconnectDatabase();
    });
};

boot();

export default app;
