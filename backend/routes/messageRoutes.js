import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    createOrGetConversation,
    getConversations,
    getMessages,
    sendMessage
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/conversations', protect, createOrGetConversation);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/conversations/:conversationId', protect, sendMessage);

export default router;
