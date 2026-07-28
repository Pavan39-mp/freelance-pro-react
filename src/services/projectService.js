import api from './api';

export const fetchProjects = async (params = {}) => {
    const res = await api.get('/projects', { params });
    return res.data;
};

// Compatibility alias
export const getProjects = fetchProjects;

export const fetchProject = async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
};

export const createProject = async (projectData) => {
    const res = await api.post('/projects', projectData);
    return res.data;
};

export const updateProject = async (id, projectData) => {
    const res = await api.put(`/projects/${id}`, projectData);
    return res.data;
};

export const deleteProject = async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
};
