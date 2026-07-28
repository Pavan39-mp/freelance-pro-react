import React, { createContext, useContext, useState, useEffect } from 'react';
import * as timerService from '../services/timerService';
import { useUser } from './UserContext';
import { useTasks } from './TaskContext';
import { useDashboard } from './DashboardContext'; // Ensure stats sync when updating

const TimeTrackingContext = createContext();

export const useTimeTracking = () => useContext(TimeTrackingContext);

export const TimeTrackingProvider = ({ children }) => {
  const { user } = useUser();
  const { refreshTasks } = useTasks() || {};

  const [activeSession, setActiveSession] = useState(null);
  const [timeSummary, setTimeSummary] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadInitialData = async () => {
    if (!user || user.role === 'client') {
      setActiveSession(null);
      setTimeSummary(null);
      setIsLoaded(true);
      return;
    }
    try {
      const active = await timerService.getActiveSession();
      setActiveSession(active);

      const summary = await timerService.getTimeSummary();
      setTimeSummary(summary);
    } catch (error) {
      console.error('Error loading time tracking data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const refreshSummary = async () => {
    try {
      const summary = await timerService.getTimeSummary();
      setTimeSummary(summary);
    } catch (error) {
      console.error('Error refreshing summary:', error);
    }
  };

  const startTimer = async (taskId, projectId) => {
    try {
      const session = await timerService.startTimer({ taskId, projectId });
      setActiveSession(session);
      if (refreshTasks) refreshTasks(); // Sync in case previous timer finished
      return session;
    } catch (error) {
      console.error('Error starting timer:', error);
      throw error;
    }
  };

  const stopTimer = async () => {
    if (!activeSession) return;
    try {
      const session = await timerService.stopTimer(activeSession._id);
      setActiveSession(null);
      await refreshSummary();
      if (refreshTasks) refreshTasks();
      return session;
    } catch (error) {
      console.error('Error stopping timer:', error);
      throw error;
    }
  };

  const addManualEntry = async (data) => {
    try {
      const session = await timerService.addManualEntry(data);
      await refreshSummary();
      if (refreshTasks) refreshTasks();
      return session;
    } catch (error) {
      console.error('Error adding manual entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await timerService.deleteEntry(id);
      if (activeSession?._id === id) setActiveSession(null);
      await refreshSummary();
      if (refreshTasks) refreshTasks();
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  const editEntry = async (id, data) => {
    try {
      const session = await timerService.editEntry(id, data);
      await refreshSummary();
      if (refreshTasks) refreshTasks();
      return session;
    } catch (error) {
      console.error('Error editing entry:', error);
      throw error;
    }
  };

  return (
    <TimeTrackingContext.Provider value={{
      activeSession,
      timeSummary,
      isLoaded,
      startTimer,
      stopTimer,
      addManualEntry,
      deleteEntry,
      editEntry,
      refreshSummary,
      getTaskSessions: timerService.getTaskSessions
    }}>
      {children}
    </TimeTrackingContext.Provider>
  );
};
