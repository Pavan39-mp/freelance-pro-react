import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadFile, getProjectFiles, downloadFile, deleteFile } from '../controllers/fileController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload path exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

router.post('/upload', protect, authorizeRoles('freelancer'), upload.single('file'), uploadFile);
router.get('/project/:projectId', protect, authorizeRoles('freelancer', 'client'), getProjectFiles);
router.get('/download/:id', protect, authorizeRoles('freelancer', 'client'), downloadFile);
router.delete('/:id', protect, authorizeRoles('freelancer'), deleteFile);

export default router;
