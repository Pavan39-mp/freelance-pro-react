import express from 'express';
import { createProposal, getMyProposals, getClientProposalProjects, getProjectProposals, updateProposalStatus } from '../controllers/projectProposalController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('freelancer'), createProposal);
router.get('/mine', protect, authorizeRoles('freelancer'), getMyProposals);
router.get('/client', protect, authorizeRoles('client'), getClientProposalProjects);
router.get('/:projectRequestId', protect, authorizeRoles('client'), getProjectProposals);
router.patch('/:proposalId/status', protect, authorizeRoles('client'), updateProposalStatus);

export default router;
