import api from './api';

export const createProposal = async (proposalData) => {
    try {
        return await api.post('/project-proposals', proposalData);
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMyProposals = async () => api.get('/project-proposals/mine');

export const getClientProposalProjects = async () => api.get('/project-proposals/client');

export const getProjectProposals = async (projectRequestId) => api.get(`/project-proposals/${projectRequestId}`);

export const updateProposalStatus = async (proposalId, status) => api.patch(`/project-proposals/${proposalId}/status`, { status });
