import React, { createContext, useState, useContext, useEffect } from 'react';
import * as activityService from '../services/activityService';
import { useUser } from './UserContext';

const ActivityContext = createContext();

export const useActivities = () => useContext(ActivityContext);

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();

  const loadActivities = async () => {
    if (!user || user.role === 'client') {
      setActivities([]);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await activityService.getActivities();
      const mapped = (res.data || []).map(act => {
        const type = act.type || 'task';
        let title = 'Activity';
        let description = '';

        if (act.action === 'created') {
          title = `${type.charAt(0).toUpperCase() + type.slice(1)} Created`;
          description = `"${act.taskName}" was created.`;
        } else if (act.action === 'commented on') {
          title = `Task Commented`;
          description = `Alex Rivera commented on "${act.taskName}".`;
        } else {
          title = `${type.charAt(0).toUpperCase() + type.slice(1)} Update`;
          description = `"${act.taskName}" was ${act.action}.`;
        }

        let icon = 'CheckCircle2';
        let color = 'primary';
        switch (type) {
          case 'client': icon = 'Users'; color = 'primary'; break;
          case 'project': icon = 'Folder'; color = 'secondary'; break;
          case 'task': icon = 'CheckCircle2'; color = 'tertiary'; break;
          case 'meeting': icon = 'Video'; color = 'secondary'; break;
          default: icon = 'Settings'; color = 'on-surface-variant'; break;
        }

        const date = act.createdAt ? new Date(act.createdAt) : new Date();
        const timestamp = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return {
          id: act._id || act.id,
          type,
          title,
          description,
          timestamp,
          icon,
          color,
          createdAt: act.createdAt || date
        };
      });
      setActivities(mapped);
    } catch (err) {
      console.error('Error loading activities:', err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  // Stub hooks client-side; backend handles auditing automatically
  const addClientActivity = () => { loadActivities(); };
  const addProjectActivity = () => { loadActivities(); };
  const addTaskActivity = () => { loadActivities(); };
  const addMeetingActivity = () => { loadActivities(); };
  const addInvoiceActivity = () => { loadActivities(); };
  const addNotificationActivity = () => { loadActivities(); };
  const addSystemActivity = () => { loadActivities(); };
  const addNoteActivity = () => { loadActivities(); };

  if (!isLoaded) return null;

  return (
    <ActivityContext.Provider value={{
      activities,
      addClientActivity,
      addProjectActivity,
      addTaskActivity,
      addMeetingActivity,
      addInvoiceActivity,
      addNotificationActivity,
      addSystemActivity,
      addNoteActivity,
      refreshActivities: loadActivities
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
