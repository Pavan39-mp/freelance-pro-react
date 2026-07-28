import express from 'express';
import { getFreelancers, getFreelancerProfile } from '../controllers/freelancerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getFreelancers);
router.route('/:id').get(protect, getFreelancerProfile);

export default router;
