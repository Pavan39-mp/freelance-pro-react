import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addProjectComment,
    getProjectComments,
    deleteProjectComment
} from '../controllers/projectController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, authorizeRoles('freelancer', 'client'), getProjects)
    .post(protect, authorizeRoles('freelancer'), createProject);

router.route('/:id')
    .get(protect, authorizeRoles('freelancer', 'client'), getProject)
    .put(protect, authorizeRoles('freelancer'), updateProject)
    .delete(protect, authorizeRoles('freelancer'), deleteProject);

router.route('/:id/comments')
    .get(protect, authorizeRoles('freelancer'), getProjectComments)
    .post(protect, authorizeRoles('freelancer'), addProjectComment);

router.delete('/:id/comments/:commentId', protect, authorizeRoles('freelancer'), deleteProjectComment);

export default router;
