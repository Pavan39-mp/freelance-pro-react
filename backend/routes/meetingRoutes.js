import express from 'express';
import {
    getMeetings,
    scheduleMeeting,
    updateMeeting,
    deleteMeeting
} from '../controllers/meetingController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, authorizeRoles('freelancer'), getMeetings)
    .post(protect, authorizeRoles('freelancer'), scheduleMeeting);

router.route('/:id')
    .put(protect, authorizeRoles('freelancer'), updateMeeting)
    .delete(protect, authorizeRoles('freelancer'), deleteMeeting);

export default router;
