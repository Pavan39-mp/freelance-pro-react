import api from './api';

export const fetchNotifications = async (params = {}) => {
  const res = await api.get('/notifications', { params });
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.put(`/notifications/${id}`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.put('/notifications/mark-all-read');
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
};
