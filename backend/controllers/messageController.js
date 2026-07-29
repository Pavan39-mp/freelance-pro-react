import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const SAFE_USER_FIELDS = 'fullName email avatar role';
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const belongsToConversation = (conversation, userId) =>
    conversation.client.equals(userId) || conversation.freelancer.equals(userId);

const populateConversation = (query) => query
    .populate('client', SAFE_USER_FIELDS)
    .populate('freelancer', SAFE_USER_FIELDS);

export const createOrGetConversation = async (req, res, next) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ success: false, message: 'Only clients can start conversations.', data: null });
        }

        const { freelancerId } = req.body;
        if (!isObjectId(freelancerId)) {
            return res.status(400).json({ success: false, message: 'A valid freelancer ID is required.', data: null });
        }

        const freelancer = await User.findById(freelancerId).select('_id role');
        if (!freelancer) {
            return res.status(404).json({ success: false, message: 'Freelancer not found.', data: null });
        }
        if (freelancer.role !== 'freelancer') {
            return res.status(400).json({ success: false, message: 'The selected user is not a freelancer.', data: null });
        }

        let conversation = await Conversation.findOne({ client: req.user._id, freelancer: freelancer._id });
        if (!conversation) {
            try {
                conversation = await Conversation.create({ client: req.user._id, freelancer: freelancer._id });
            } catch (error) {
                if (error.code !== 11000) throw error;
                conversation = await Conversation.findOne({ client: req.user._id, freelancer: freelancer._id });
            }
        }

        conversation = await populateConversation(Conversation.findById(conversation._id));
        return res.json({ success: true, message: 'Conversation ready.', data: conversation });
    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req, res, next) => {
    try {
        if (!['client', 'freelancer'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Messaging is not available for this role.', data: null });
        }
        const ownerField = req.user.role === 'client' ? 'client' : 'freelancer';
        const conversations = await populateConversation(
            Conversation.find({ [ownerField]: req.user._id }).sort({ lastMessageAt: -1, updatedAt: -1 })
        );
        return res.json({ success: true, message: 'Conversations retrieved.', data: conversations });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        if (!isObjectId(conversationId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID.', data: null });
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found.', data: null });
        }
        if (!belongsToConversation(conversation, req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot access this conversation.', data: null });
        }

        await Message.updateMany(
            { conversation: conversation._id, receiver: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        const messages = await Message.find({ conversation: conversation._id })
            .populate('sender', SAFE_USER_FIELDS)
            .populate('receiver', SAFE_USER_FIELDS)
            .sort({ createdAt: 1 });
        return res.json({ success: true, message: 'Messages retrieved.', data: messages });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        if (!isObjectId(conversationId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID.', data: null });
        }
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
        if (!text || text.length > 2000) {
            return res.status(400).json({ success: false, message: 'Message must be between 1 and 2000 characters.', data: null });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found.', data: null });
        }
        if (!belongsToConversation(conversation, req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot send messages in this conversation.', data: null });
        }

        const receiver = conversation.client.equals(req.user._id)
            ? conversation.freelancer
            : conversation.client;
        let message = await Message.create({
            conversation: conversation._id,
            sender: req.user._id,
            receiver,
            text
        });
        conversation.lastMessage = text;
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        message = await Message.findById(message._id)
            .populate('sender', SAFE_USER_FIELDS)
            .populate('receiver', SAFE_USER_FIELDS);
        return res.status(201).json({ success: true, message: 'Message sent.', data: message });
    } catch (error) {
        next(error);
    }
};
