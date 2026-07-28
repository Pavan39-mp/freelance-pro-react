import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchNotes, createNote as createNoteService, updateNote as updateNoteService, deleteNote as deleteNoteService } from '../services/NoteService';
import { useClients } from './ClientContext';
import { useProjects } from './ProjectContext';
import { useUser } from './UserContext';
import toast from 'react-hot-toast';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();
  const { clients } = useClients();
  const { projects } = useProjects();

  const loadNotes = async () => {
    if (!user || user.role === 'client') {
      setNotes([]);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await fetchNotes();
      setNotes(res || []);
    } catch (err) {
      console.error('Error loading notes:', err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const addNote = async (noteData) => {
    try {
      // Resolve client name String to ObjectId ref
      let clientId = null;
      if (noteData.client) {
        const foundClient = clients.find(c => c.name === noteData.client || c.fullName === noteData.client);
        if (foundClient) clientId = foundClient.id || foundClient._id;
      }

      // Resolve project title String to ObjectId ref
      let projectId = null;
      if (noteData.project) {
        const foundProj = projects.find(p => p.title === noteData.project || p.name === noteData.project);
        if (foundProj) projectId = foundProj.id || foundProj._id;
      }

      const payload = {
        title: noteData.title,
        description: noteData.description,
        category: noteData.category || '',
        priority: noteData.priority || 'Medium',
        client: clientId,
        project: projectId,
        reminderDate: noteData.reminderDate || ''
      };

      const res = await createNoteService(payload);
      if (res) {
        setNotes(prev => [res, ...prev]);
        toast.success('Note created successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding note:', err.message);
      toast.error(err.message || 'Failed to create note');
      return false;
    }
  };

  const updateNote = async (id, updatedData) => {
    try {
      let clientId = undefined;
      if (updatedData.client !== undefined) {
        if (!updatedData.client) clientId = null;
        else {
          const foundClient = clients.find(c => c.name === updatedData.client || c.fullName === updatedData.client);
          clientId = foundClient ? (foundClient.id || foundClient._id) : null;
        }
      }

      let projectId = undefined;
      if (updatedData.project !== undefined) {
        if (!updatedData.project) projectId = null;
        else {
          const foundProj = projects.find(p => p.title === updatedData.project || p.name === updatedData.project);
          projectId = foundProj ? (foundProj.id || foundProj._id) : null;
        }
      }

      const payload = {
        ...updatedData,
        client: clientId,
        project: projectId
      };

      const res = await updateNoteService(id, payload);
      if (res) {
        setNotes(prev => prev.map(n => (n._id === id || n.id === id) ? res : n));
        toast.success('Note updated successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating note:', err.message);
      toast.error(err.message || 'Failed to update note');
      return false;
    }
  };

  const deleteNote = async (id) => {
    try {
      await deleteNoteService(id);
      setNotes(prev => prev.filter(n => n._id !== id && n.id !== id));
      toast.success('Note deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting note:', err.message);
      toast.error(err.message || 'Failed to delete note');
      return false;
    }
  };

  if (!isLoaded) return null;

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, refreshNotes: loadNotes }}>
      {children}
    </NoteContext.Provider>
  );
};
