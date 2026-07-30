import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    createOrGetConversation,
    getConversations,
    getMessages,
    sendMessage,
    getProjectRequestMessages,
    sendProjectRequestMessage
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/conversations', protect, createOrGetConversation);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/conversations/:conversationId', protect, sendMessage);
router.get('/project-requests/:projectRequestId', protect, getProjectRequestMessages);
router.post('/project-requests/:projectRequestId', protect, sendProjectRequestMessage);

export default router;
