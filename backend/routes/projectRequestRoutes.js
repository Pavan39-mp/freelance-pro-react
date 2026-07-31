import express from 'express';
import {
    createProjectRequest,
    getMyRequests,
    updateRequestStatus,
    deleteRequest
} from '../controllers/projectRequestController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('client'), createProjectRequest);
router.get('/', protect, getMyRequests);

router.route('/:id').delete(protect, deleteRequest);
router.route('/:id/status').patch(protect, updateRequestStatus);

export default router;
