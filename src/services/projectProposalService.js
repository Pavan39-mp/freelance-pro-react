import api from './api';

export const createProposal = async (proposalData) => {
    try {
        return await api.post('/project-proposals', proposalData);
    } catch (error) {
        throw error.response?.data || error;
    }
};
