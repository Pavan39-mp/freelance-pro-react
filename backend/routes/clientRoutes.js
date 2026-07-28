import express from 'express';
import { getClients } from '../controllers/clientController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const forbidClientMutations = (req, res) => res.status(403).json({
    success: false,
    message: 'Client records are created through accepted project requests and cannot be modified manually.',
    data: null
});

router.route('/')
    .get(protect, authorizeRoles('freelancer'), getClients)
    .post(protect, forbidClientMutations);

router.route('/:id')
    .put(protect, forbidClientMutations)
    .delete(protect, forbidClientMutations);

router.patch('/:id/archive', protect, forbidClientMutations);
router.patch('/:id/unarchive', protect, forbidClientMutations);

export default router;
