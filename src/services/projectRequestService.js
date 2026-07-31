import api from './api';

export const createProjectRequest = async (requestData) => {
    try {
        const response = await api.post('/project-requests', requestData);
        return response;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createMarketplaceProjectRequest = createProjectRequest;

export const getMyProjectRequests = async () => {
    try {
        const response = await api.get('/project-requests');
        return response;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateRequestStatus = async (id, status) => {
    try {
        const response = await api.patch(`/project-requests/${id}/status`, { status });
        return response;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteProjectRequest = async (id) => {
    try {
        const response = await api.delete(`/project-requests/${id}`);
        return response;
    } catch (error) {
        throw error.response?.data || error;
    }
};
