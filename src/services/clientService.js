import api from './api';

export const getClients = async (params = {}) => {
    const res = await api.get('/clients', { params });
    return res.data;
};
