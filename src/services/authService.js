import api from './api';

export const register = async (fullName, email, password, role) => {
    return await api.post('/api/auth/register', {
        fullName: String(fullName || '').trim(),
        email: String(email || '').trim().toLowerCase(),
        password,
        role: String(role || '').trim().toLowerCase(),
    });
};

export const login = async (email, password, role) => {
    return await api.post('/api/auth/login', {
        email: String(email || '').trim().toLowerCase(),
        password,
        role: String(role || '').trim().toLowerCase(),
    });
};

export const logout = async () => {
    localStorage.removeItem('freelancepro_token');
    return await api.post('/api/auth/logout');
};

export const getMe = async () => {
    return await api.get('/api/auth/me');
};

export const updateMe = async (updates) => {
    return await api.put('/api/auth/me', updates);
};

export const forgotPassword = async (email) => {
    return await api.post('/api/auth/forgot-password', { email: String(email || '').trim().toLowerCase() });
};

export const resetPassword = async (token, password, confirmPassword) => {
    return await api.put(`/api/auth/reset-password/${encodeURIComponent(token)}`, { password, confirmPassword });
};
