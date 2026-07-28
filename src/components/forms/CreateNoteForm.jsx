import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotes } from '../../context/NoteContext';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import { useNotifications } from '../../context/NotificationContext';
import { useActivities } from '../../context/ActivityContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const CreateNoteForm = ({ onClose }) => {
  const { addNote } = useNotes();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { addNotification } = useNotifications();
  const { addNoteActivity } = useActivities();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    client: '',
    project: '',
    priority: 'Medium',
    description: '',
    reminderDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Note Title is required');
      return;
    }
    if (!formData.description) {
      toast.error('Description is required');
      return;
    }

    const success = await addNote(formData);
    if (success) {
      if (addNotification) {
        addNotification('new project', 'New Note Created', `Created note: "${formData.title}".`);
      }
      if (addNoteActivity) {
        addNoteActivity({
          action: 'created',
          noteTitle: formData.title
        });
      }
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', category: '', client: '', project: '',
      priority: 'Medium', description: '', reminderDate: ''
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Create Note</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6">
          <form id="create-note-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="md:col-span-2">
                <Input
                  label="Note Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Category"
                name="category"
                placeholder="e.g. Design, Meeting, Personal"
                value={formData.category}
                onChange={handleChange}
              />

              <Input
                type="select"
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={["High", "Medium", "Low"]}
              />

              <Input
                type="select"
                label="Related Client (Optional)"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="Select a client..."
                options={clients.map(c => c.name)}
              />

              <Input
                type="select"
                label="Related Project (Optional)"
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="Select a project..."
                options={projects.map(p => p.title)}
              />

              <div className="md:col-span-2">
                <Input
                  type="date"
                  label="Reminder Date (Optional)"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Input
              type="textarea"
              label="Description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </form>
        </div>

        <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
          <Button
            variant="outline"
            onClick={resetForm}
            className="mr-auto"
          >
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-note-form">
            Save Note
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateNoteForm;
