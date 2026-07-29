import express from 'express';
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, authorizeRoles('freelancer', 'client'), getNotifications);

router.put('/mark-all-read', protect, authorizeRoles('freelancer', 'client'), markAllNotificationsRead);

router.route('/:id')
    .put(protect, authorizeRoles('freelancer', 'client'), markNotificationRead)
    .delete(protect, authorizeRoles('freelancer', 'client'), deleteNotification);

export default router;
