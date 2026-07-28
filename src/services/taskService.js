import api from './api';

export const getTasks = async (params = {}) => {
    const res = await api.get('/tasks', { params });
    return res.data;
};

export const addTask = async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
};

export const updateTask = async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
};

export const updateTaskProgress = async (id, payload) => {
    const res = await api.put(`/tasks/${id}/progress`, payload);
    return res.data;
};

export const undoLastProgress = async (id) => {
    const res = await api.post(`/tasks/${id}/undo`);
    return res.data;
};

export const deleteTask = async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
};

// Comments
export const addComment = async (id, text) => {
    const res = await api.post(`/tasks/${id}/comments`, { text });
    return res.data;
};

export const editComment = async (id, commentId, text) => {
    const res = await api.put(`/tasks/${id}/comments/${commentId}`, { text });
    return res.data;
};

export const deleteComment = async (id, commentId) => {
    const res = await api.delete(`/tasks/${id}/comments/${commentId}`);
    return res.data;
};

// Attachments
export const addAttachment = async (id, fileData) => {
    let payload = fileData;
    if (fileData instanceof File) {
        payload = new FormData();
        payload.append('file', fileData);
    }
    const res = await api.post(`/tasks/${id}/attachments`, payload);
    return res.data;
};

export const deleteAttachment = async (taskId, fileId) => {
    const res = await api.delete(`/files/${fileId}`);
    return res;
};
