import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useClients } from '../../context/ClientContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AddTaskForm = ({ onClose }) => {
  const { addTask } = useTasks();
  const { projects } = useProjects();
  const { clients } = useClients();

  const [formData, setFormData] = useState({
    title: '',
    client: '',
    project: '',
    priority: 'Normal',
    status: 'To Do',
    estimatedHours: '',
    deadline: '',
    description: ''
  });
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeClients = Array.isArray(clients) ? clients : [];
  const selectedProject = safeProjects.find(projectItem =>
    String(projectItem._id || projectItem.id) === String(formData.project)
  );
  const projectDeadline = new Date(selectedProject?.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  projectDeadline.setHours(0, 0, 0, 0);
  const isProjectOverdue = selectedProject?.dueDate
    && !Number.isNaN(projectDeadline.getTime())
    && today > projectDeadline;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-clear project if client changes
    if (name === 'client') {
      setFormData(prev => ({ ...prev, [name]: value, project: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Task Name is required');
      return;
    }
    if (!formData.client) {
      toast.error('Please select a Client');
      return;
    }
    if (!formData.project) {
      toast.error('Please select a Project');
      return;
    }

    if (!selectedProject) {
      toast.error("Selected project not found");
      return;
    }
    if (isProjectOverdue) {
      toast.error('Cannot create task. Project deadline has passed.');
      return;
    }

    const taskToAdd = {
      ...formData,
      projectId: formData.project,
    };

    try {
      await addTask(taskToAdd);
      toast.success('Task added successfully');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const availableProjects = safeProjects.filter(p => {
    // Safely extract client or platformClient ID and convert to string for reliable comparison
    const rawClient = p.client || p.platformClient || null;
    let pClientId = null;
    if (rawClient) {
      if (typeof rawClient === 'object' && rawClient._id) {
        pClientId = rawClient._id.toString();
      } else {
        pClientId = rawClient.toString();
      }
    }
    return pClientId === String(formData.client);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Add New Task</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6">
          <form id="add-task-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="md:col-span-2">
                <Input
                  label="Task Name"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                type="select"
                label="Select Client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                placeholder="Select a client..."
                options={safeClients.map(c => ({ value: c._id, label: c.fullName || c.name }))}
              />

              <div className="space-y-1">
                <Input
                  type="select"
                  label="Select Project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  disabled={!formData.client}
                  placeholder="Select a project..."
                  options={availableProjects.map(p => ({ value: p._id, label: p.title || p.name }))}
                />
                {formData.client && availableProjects.length === 0 && (
                  <p className="text-[10px] text-error ml-1 mt-1">This client has no projects.</p>
                )}
                {isProjectOverdue && (
                  <p className="text-[10px] text-error ml-1 mt-1">Cannot create task. Project deadline has passed.</p>
                )}
              </div>

              <Input
                type="number"
                label="Estimated Hours"
                name="estimatedHours"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={handleChange}
              />

              <Input
                type="date"
                label="Due Date"
                name="deadline"
                value={formData.deadline}
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
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={["To Do", "In Progress", "Completed", "On Hold"]}
              />
            </div>

            <Input
              type="textarea"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </form>
        </div>

        <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
          <Button
            variant="outline"
            onClick={() => setFormData({ title: '', client: '', project: '', priority: 'Normal', status: 'To Do', estimatedHours: '', deadline: '', description: '' })}
            className="mr-auto"
          >
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-task-form" disabled={isProjectOverdue === true}>
            Save Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;
