import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import ProjectRequest from '../models/ProjectRequest.js';

const SAFE_USER_FIELDS = 'fullName email avatar role';
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const belongsToConversation = (conversation, userId) =>
    conversation.client.equals(userId) || conversation.freelancer.equals(userId);

const populateConversation = (query) => query
    .populate('client', SAFE_USER_FIELDS)
    .populate('freelancer', SAFE_USER_FIELDS);

const getProjectRequestForParticipant = async (projectRequestId, userId) => {
    if (!isObjectId(projectRequestId)) return { status: 400, message: 'Invalid project request ID.' };
    const projectRequest = await ProjectRequest.findById(projectRequestId);
    if (!projectRequest) return { status: 404, message: 'Project request not found.' };
    if (projectRequest.requestType === 'marketplace' || !projectRequest.freelancer) {
        return { status: 403, message: 'Messaging is not available for marketplace requests.' };
    }
    const isClient = projectRequest.client.equals(userId);
    const isFreelancer = projectRequest.freelancer.equals(userId);
    if (!isClient && !isFreelancer) return { status: 403, message: 'You cannot access this project request conversation.' };
    return { projectRequest, isClient };
};

const findOrCreateParticipantConversation = async (projectRequest) => {
    let conversation = await Conversation.findOne({ client: projectRequest.client, freelancer: projectRequest.freelancer });
    if (conversation) return conversation;
    try {
        return await Conversation.create({ client: projectRequest.client, freelancer: projectRequest.freelancer });
    } catch (error) {
        if (error.code !== 11000) throw error;
        return Conversation.findOne({ client: projectRequest.client, freelancer: projectRequest.freelancer });
    }
};

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
            {
                conversation: conversation._id,
                receiver: req.user._id,
                isRead: false,
                $or: [{ conversationType: 'direct' }, { conversationType: { $exists: false } }]
            },
            { $set: { isRead: true } }
        );
        const messages = await Message.find({
            conversation: conversation._id,
            $or: [{ conversationType: 'direct' }, { conversationType: { $exists: false } }]
        })
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
            conversationType: 'direct',
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

export const getProjectRequestMessages = async (req, res, next) => {
    try {
        const access = await getProjectRequestForParticipant(req.params.projectRequestId, req.user._id);
        if (!access.projectRequest) {
            return res.status(access.status).json({ success: false, message: access.message, data: null });
        }

        await Message.updateMany(
            { projectRequest: access.projectRequest._id, receiver: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        const messages = await Message.find({
            projectRequest: access.projectRequest._id,
            conversationType: 'project-request'
        })
            .populate('sender', SAFE_USER_FIELDS)
            .populate('receiver', SAFE_USER_FIELDS)
            .sort({ createdAt: 1 });
        return res.json({ success: true, message: 'Project request messages retrieved.', data: messages });
    } catch (error) {
        next(error);
    }
};

export const sendProjectRequestMessage = async (req, res, next) => {
    try {
        const access = await getProjectRequestForParticipant(req.params.projectRequestId, req.user._id);
        if (!access.projectRequest) {
            return res.status(access.status).json({ success: false, message: access.message, data: null });
        }
        if (access.projectRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This project request is no longer pending. Continue communication from the project.',
                data: null
            });
        }
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
        if (!text || text.length > 2000) {
            return res.status(400).json({ success: false, message: 'Message must be between 1 and 2000 characters.', data: null });
        }

        const conversation = await findOrCreateParticipantConversation(access.projectRequest);
        const receiver = access.isClient ? access.projectRequest.freelancer : access.projectRequest.client;
        let message = await Message.create({
            conversation: conversation._id,
            conversationType: 'project-request',
            projectRequest: access.projectRequest._id,
            sender: req.user._id,
            receiver,
            text
        });
        message = await Message.findById(message._id)
            .populate('sender', SAFE_USER_FIELDS)
            .populate('receiver', SAFE_USER_FIELDS);
        return res.status(201).json({ success: true, message: 'Message sent.', data: message });
    } catch (error) {
        next(error);
    }
};
