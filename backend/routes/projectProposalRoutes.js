import express from 'express';
import { createProposal } from '../controllers/projectProposalController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('freelancer'), createProposal);

export default router;
