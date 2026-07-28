import api from './api';

export const startTimer = async (data) => {
  const response = await api.post('/timer/start', data);
  return response;
};

export const stopTimer = async (id) => {
  const response = await api.put(`/timer/${id}/stop`);
  return response;
};

export const addManualEntry = async (data) => {
  const response = await api.post('/timer/manual', data);
  return response;
};

export const editEntry = async (id, data) => {
  const response = await api.put(`/timer/${id}`, data);
  return response;
};

export const deleteEntry = async (id) => {
  const response = await api.delete(`/timer/${id}`);
  return response;
};

export const getTaskSessions = async (taskId) => {
  const response = await api.get(`/timer/task/${taskId}`);
  return response;
};

export const getActiveSession = async () => {
  const response = await api.get('/timer/active');
  return response;
};

export const getTimeSummary = async () => {
  const response = await api.get('/timer/summary');
  return response;
};
