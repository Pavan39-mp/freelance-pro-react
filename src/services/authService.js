import api from './api';

export const register = async (fullName, email, password, role) => {
    return await api.post('/auth/register', {
        fullName: String(fullName || '').trim(),
        email: String(email || '').trim().toLowerCase(),
        password,
        role: String(role || '').trim().toLowerCase(),
    });
};

export const login = async (email, password, role) => {
    return await api.post('/auth/login', {
        email: String(email || '').trim().toLowerCase(),
        password,
        role: String(role || '').trim().toLowerCase(),
    });
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

export const resetPassword = async (token, password) => {
    return await api.post('/auth/reset-password', { token, password });
};
