import express from 'express';
import {
    createRequest,
    getMyRequests,
    updateRequestStatus,
    deleteRequest
} from '../controllers/projectRequestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, createRequest)
    .get(protect, getMyRequests);

router.route('/:id').delete(protect, deleteRequest);
router.route('/:id/status').patch(protect, updateRequestStatus);

export default router;
