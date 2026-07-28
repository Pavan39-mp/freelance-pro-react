import api from './api';

export const updateSettings = async (settingsData) => {
    const res = await api.put('/auth/me', settingsData);
    return res.data;
};
