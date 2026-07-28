import api from './api';

export const fetchNotes = async (params = {}) => {
  const res = await api.get('/notes', { params });
  return res.data;
};

export const createNote = async (noteData) => {
  const res = await api.post('/notes', noteData);
  return res.data;
};

export const updateNote = async (id, noteData) => {
  const res = await api.put(`/notes/${id}`, noteData);
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
};
