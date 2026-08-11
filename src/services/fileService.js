import api from './api';

export const getProjectFiles = async (projectId) => {
    return api.get(`/files/project/${projectId}`);
};

export const uploadProjectFile = async (formData) => {
    return api.post('/files/upload', formData);
};

export const downloadFile = async (fileId) => {
    return api.get(`/files/download/${fileId}`, { responseType: 'blob' });
};

export const deleteFile = async (fileId) => {
    return api.delete(`/files/${fileId}`);
};
