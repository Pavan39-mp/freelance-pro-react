import express from 'express';
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} from '../controllers/noteController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .get(getNoteById)
    .put(updateNote)
    .delete(deleteNote);

export default router;
