import React, { createContext, useContext } from 'react';
import { useUser } from './UserContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user, updateUser } = useUser();

  const notifications = user?.notificationPreferences || {
    desktop: true,
    email: true,
    meetingReminders: true,
    taskDueAlerts: true,
    clientUpdates: false,
    projectUpdates: true,
  };

  const updateNotification = async (key, value) => {
    if (user) {
      const nextPrefs = {
        ...notifications,
        [key]: value
      };
      await updateUser({ notificationPreferences: nextPrefs });
    }
  };

  return (
    <SettingsContext.Provider value={{ notifications, updateNotification }}>
      {children}
    </SettingsContext.Provider>
  );
};
