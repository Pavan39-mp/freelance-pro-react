import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
    getTasks,
    addTask,
    updateTask,
    updateTaskProgress,
    undoLastProgress,
    deleteTask,
    addComment,
    editComment,
    deleteComment,
    addAttachment
} from '../controllers/taskController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for task attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

router.route('/')
    .get(protect, authorizeRoles('freelancer', 'client'), getTasks)
    .post(protect, authorizeRoles('freelancer'), addTask);

router.route('/:id')
    .put(protect, authorizeRoles('freelancer'), updateTask)
    .delete(protect, authorizeRoles('freelancer'), deleteTask);

router.put('/:id/progress', protect, authorizeRoles('freelancer'), updateTaskProgress);
router.post('/:id/undo', protect, authorizeRoles('freelancer'), undoLastProgress);

// Comments
router.post('/:id/comments', protect, authorizeRoles('freelancer'), addComment);
router.route('/:id/comments/:commentId')
    .put(protect, authorizeRoles('freelancer'), editComment)
    .delete(protect, authorizeRoles('freelancer'), deleteComment);

// Attachments
router.post('/:id/attachments', protect, authorizeRoles('freelancer'), upload.single('file'), addAttachment);

export default router;
