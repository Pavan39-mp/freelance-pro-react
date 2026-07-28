import api from './api';

export const getFreelancers = async (params = {}) => {
    try {
        const response = await api.get('/freelancers', { params });
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getFreelancerProfile = async (id) => {
    try {
        const response = await api.get(`/freelancers/${id}`);
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
