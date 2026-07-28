import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMeetings } from '../../context/MeetingContext';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import { useNotifications } from '../../context/NotificationContext';
import { useActivities } from '../../context/ActivityContext';
import { X, Video, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ScheduleMeetingForm = ({ onClose, isEmbedded = false, prefillClient = null }) => {
  const { addMeeting } = useMeetings();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { addNotification } = useNotifications();
  const { addMeetingActivity } = useActivities();

  const [formData, setFormData] = useState({
    title: '',
    client: prefillClient?.name || '',
    clientEmail: prefillClient?.email || '',
    project: '',
    date: '',
    time: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    duration: '30',
    provider: 'Google Meet',
    additionalParticipants: '',
    agenda: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEmbedded) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isEmbedded]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'client') {
      const selectedClient = clients.find(c => c.name === value);
      setFormData(prev => ({
        ...prev,
        client: value,
        clientEmail: selectedClient?.email || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title) {
      toast.error('Meeting Title is required');
      document.querySelector('[name="title"]')?.focus();
      return;
    }
    if (!formData.client) {
      toast.error('Client is required');
      document.querySelector('[name="client"]')?.focus();
      return;
    }
    if (!formData.clientEmail) {
      toast.error('Client Email is required');
      document.querySelector('[name="clientEmail"]')?.focus();
      return;
    }
    if (!formData.project) {
      toast.error('Project is required');
      document.querySelector('[name="project"]')?.focus();
      return;
    }
    if (!formData.date) {
      toast.error('Meeting Date is required');
      document.querySelector('[name="date"]')?.focus();
      return;
    }
    if (!formData.time) {
      toast.error('Meeting Time is required');
      document.querySelector('[name="time"]')?.focus();
      return;
    }
    if (!formData.duration) {
      toast.error('Duration is required');
      document.querySelector('[name="duration"]')?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Call Context addMeeting which schedules meeting and updates state
      const response = await addMeeting(formData);

      if (response) {
        addNotification('new task', 'Meeting Scheduled', `Scheduled "${formData.title}" on ${formData.date} at ${formData.time}.`);
        addMeetingActivity({
          action: 'scheduled',
          title: formData.title,
          client: formData.client
        });

        toast.success('Meeting scheduled successfully');
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to schedule meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', client: '', clientEmail: '', project: '', date: '', time: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, duration: '30',
      provider: 'Google Meet', additionalParticipants: '', agenda: '', notes: ''
    });
  };

  const formContent = (
    <div className={`flex flex-col h-full bg-surface-container-high rounded-3xl overflow-hidden w-full ${!isEmbedded ? 'border border-outline-variant/20 shadow-2xl' : ''}`}>
      {!isEmbedded && (
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 shrink-0">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Schedule Meeting</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <form id="add-meeting-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="md:col-span-2">
              <Input
                label="Meeting Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              type="select"
              label="Client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
              placeholder="Select a client..."
              options={clients.map(c => c.name)}
            />

            <Input
              type="email"
              label="Client Email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              required
            />

            <Input
              type="select"
              label="Project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              placeholder="Select a project..."
              options={projects.map(p => p.title)}
            />

            <Input
              type="date"
              label="Meeting Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <Input
              type="time"
              label="Meeting Time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />

            <Input
              type="select"
              label="Time Zone"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              options={[
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'London (GMT)' },
                { value: 'Europe/Paris', label: 'Central Europe (CET)' },
                { value: 'Asia/Kolkata', label: 'India (IST)' },
                { value: 'Asia/Tokyo', label: 'Japan (JST)' },
                { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
              ]}
            />

            <Input
              type="number"
              label="Duration (mins)"
              name="duration"
              min="15"
              step="15"
              value={formData.duration}
              onChange={handleChange}
              required
            />

            <Input
              type="select"
              label="Meeting Provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              options={["Google Meet", "Zoom"]}
            />

            <div className="md:col-span-2">
              <Input
                label="Additional Participants (comma separated emails)"
                name="additionalParticipants"
                placeholder="e.g. team@client.com, developer@nexus.com"
                value={formData.additionalParticipants}
                onChange={handleChange}
              />
            </div>

          </div>

          <Input
            type="textarea"
            label="Agenda"
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            rows={3}
            placeholder="What will be discussed?"
          />

          <Input
            type="textarea"
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </form>
      </div>

      <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low shrink-0">
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
        <Button
          type="submit"
          form="add-meeting-form"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <><Clock className="w-3.5 h-3.5 animate-spin" /> Scheduling...</>
          ) : (
            'Schedule Meeting'
          )}
        </Button>
      </div>
    </div>
  );

  if (isEmbedded) return formContent;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {formContent}
      </div>
    </div>,
    document.body
  );
};

export default ScheduleMeetingForm;
