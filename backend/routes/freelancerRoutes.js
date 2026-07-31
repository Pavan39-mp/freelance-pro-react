import express from 'express';
import { getFreelancers, getFreelancerProfile, getFreelancerReviews, getFreelancerCompletedProjects } from '../controllers/freelancerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getFreelancers);
router.route('/:id/reviews').get(protect, getFreelancerReviews);
router.route('/:id/completed-projects').get(protect, getFreelancerCompletedProjects);
router.route('/:id').get(protect, getFreelancerProfile);

export default router;
