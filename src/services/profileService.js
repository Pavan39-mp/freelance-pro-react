import api from './api';

export const getProfile = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};

export const saveUserProfile = async (userData) => {
    const res = await api.put('/auth/me', userData);
    return res.data;
};
