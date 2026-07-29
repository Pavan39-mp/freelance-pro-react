import api from './api';

export const createOrGetConversation = async (freelancerId) =>
    api.post('/messages/conversations', { freelancerId });

export const getConversations = async () =>
    api.get('/messages/conversations');

export const getMessages = async (conversationId) =>
    api.get(`/messages/conversations/${conversationId}`);

export const sendMessage = async (conversationId, text) =>
    api.post(`/messages/conversations/${conversationId}`, { text });
