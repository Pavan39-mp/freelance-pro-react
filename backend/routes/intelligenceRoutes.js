import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import {
    getClientReliability,
    getMyPortfolio,
    getMyProductivity,
    getProjectIntelligence
} from '../controllers/intelligenceController.js';

const router = express.Router();
router.use(protect);
router.get('/productivity', authorizeRoles('freelancer'), getMyProductivity);
router.get('/portfolio', authorizeRoles('freelancer'), getMyPortfolio);
router.get('/projects/:projectId', authorizeRoles('freelancer', 'client'), getProjectIntelligence);
router.get('/clients/:clientId/reliability', authorizeRoles('freelancer', 'client'), getClientReliability);

export default router;
