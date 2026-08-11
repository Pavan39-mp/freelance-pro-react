import api from './api';

export const getProductivity = () => api.get('/intelligence/productivity');
export const getPortfolio = () => api.get('/intelligence/portfolio');
export const getProjectIntelligence = projectId => api.get(`/intelligence/projects/${projectId}`);
export const getClientReliability = clientId => api.get(`/intelligence/clients/${clientId}/reliability`);
