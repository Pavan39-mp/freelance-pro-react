import express from 'express';
import { getActivities } from '../controllers/activityController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('freelancer'), getActivities);

export default router;
