import api from './api';

export const register = async (fullName, email, password, role) => {
    return await api.post('/auth/register', { fullName, email, password, role });
};

export const login = async (email, password) => {
    return await api.post('/auth/login', { email, password });
};

export const logout = async () => {
    localStorage.removeItem('freelancepro_token');
    return await api.post('/auth/logout');
};

export const getMe = async () => {
    return await api.get('/auth/me');
};

export const updateMe = async (updates) => {
    return await api.put('/auth/me', updates);
};

export const forgotPassword = async (email) => {
    return await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (email, password) => {
    return await api.post('/auth/reset-password', { email, password });
};
