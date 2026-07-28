import File from '../models/File.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if user has access to a project
const checkProjectAccess = async (projectId, userId) => {
    const project = await Project.findOne({ _id: projectId, createdBy: userId });
    return !!project;
};

// @desc    Upload file to a project (and optionally a task)
// @route   POST /api/files/upload
// @access  Private
export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please select a file to upload');
        }

        const { projectId, taskId } = req.body;
        if (!projectId) {
            // Cleanup file if project is not specified
            fs.unlinkSync(req.file.path);
            res.status(400);
            throw new Error('projectId is required');
        }

        const userId = req.user._id;

        // Check project access
        const hasAccess = await checkProjectAccess(projectId, userId);
        if (!hasAccess) {
            fs.unlinkSync(req.file.path);
            res.status(403);
            throw new Error('Not authorized to upload files to this project');
        }

        // If taskId is provided, verify it belongs to the project
        if (taskId) {
            const task = await Task.findOne({ _id: taskId, projectId, createdBy: userId });
            if (!task) {
                fs.unlinkSync(req.file.path);
                res.status(403);
                throw new Error('Not authorized to link this task to the file');
            }
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const fileRecord = await File.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
            projectId,
            taskId: taskId || null,
            uploadedBy: userId,
            uploaderName: req.user.fullName
        });

        // Add to project-level activity
        await Activity.create({
            action: 'uploaded file',
            taskName: req.file.originalname,
            type: 'project',
            userRef: userId,
            userName: req.user.fullName
        });

        await Notification.create({
            type: 'project',
            title: 'New File Uploaded',
            message: `File "${req.file.originalname}" was uploaded to project.`,
            user: userId
        });

        // If uploaded to a task, log a task activity too
        if (taskId) {
            const task = await Task.findById(taskId);
            if (task) {
                await Activity.create({
                    action: 'uploaded file to',
                    taskName: task.title,
                    type: 'task',
                    userRef: userId,
                    userName: req.user.fullName
                });
                await Notification.create({
                    type: 'task',
                    title: 'New Task Attachment',
                    message: `File "${req.file.originalname}" was uploaded to task "${task.title}".`,
                    user: userId
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: fileRecord
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Get all files for project
// @route   GET /api/files/project/:projectId
// @access  Private
export const getProjectFiles = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const hasAccess = await checkProjectAccess(projectId, userId);
        if (!hasAccess) {
            res.status(403);
            throw new Error('Not authorized to view files for this project');
        }

        const files = await File.find({ projectId, uploadedBy: userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Project files retrieved successfully',
            data: files
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Download a file
// @route   GET /api/files/download/:id
// @access  Private
export const downloadFile = async (req, res, next) => {
    try {
        const fileRecord = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!fileRecord) {
            res.status(404);
            throw new Error('File not found');
        }

        const filePath = path.join(__dirname, '..', 'uploads', fileRecord.storedName);
        if (!fs.existsSync(filePath)) {
            res.status(404);
            throw new Error('File could not be found on server disk');
        }

        res.download(filePath, fileRecord.originalName);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req, res, next) => {
    try {
        const fileRecord = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!fileRecord) {
            res.status(404);
            throw new Error('File not found');
        }

        const filePath = path.join(__dirname, '..', 'uploads', fileRecord.storedName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await File.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'File deleted successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};
