import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('freelancer'), globalSearch);

export default router;
