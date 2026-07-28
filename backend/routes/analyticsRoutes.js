import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('freelancer'), getAnalytics);

export default router;
