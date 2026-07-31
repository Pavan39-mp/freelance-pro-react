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
        const [profileResponse, reviewsResponse, projectsResponse] = await Promise.all([
            api.get(`/freelancers/${id}`),
            api.get(`/freelancers/${id}/reviews`),
            api.get(`/freelancers/${id}/completed-projects`)
        ]);
        return {
            ...profileResponse,
            data: {
                ...profileResponse.data,
                averageRating: reviewsResponse.data?.averageRating || 0,
                totalReviews: reviewsResponse.data?.totalReviews || 0,
                reviews: reviewsResponse.data?.reviews || [],
                completedProjects: projectsResponse.data || [],
                totalCompletedProjects: projectsResponse.data?.length || 0
            }
        };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
