import api from './api';

export const fetchMeetings = async () => {
  const res = await api.get('/meetings');
  return res.data;
};

export const scheduleMeeting = async (meetingData) => {
  const res = await api.post('/meetings', meetingData);
  return { success: true, meeting: res.data };
};

export const fetchMeeting = async (id) => {
  const res = await api.get(`/meetings/${id}`);
  return res.data;
};

export const updateMeeting = async (id, meetingData) => {
  const res = await api.put(`/meetings/${id}`, meetingData);
  return res.data;
};

export const deleteMeeting = async (id) => {
  const res = await api.delete(`/meetings/${id}`);
  return res.data;
};
