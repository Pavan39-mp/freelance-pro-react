import React, { createContext, useState, useContext, useEffect } from 'react';
import * as meetingService from '../services/MeetingService';
import { useNotifications } from './NotificationContext';
import { useUser } from './UserContext';

const calculateStatus = (dateStr, timeStr, durationMins) => {
  if (!dateStr || !timeStr) return 'Scheduled';
  const meetingStart = new Date(`${dateStr}T${timeStr}`);
  const meetingEnd = new Date(meetingStart.getTime() + (durationMins || 30) * 60000);
  const now = new Date();

  if (now > meetingEnd) return 'Completed';
  if (now >= meetingStart && now <= meetingEnd) return 'Ongoing';
  return 'Scheduled';
};

const MeetingContext = createContext();

export const useMeetings = () => useContext(MeetingContext);

export const MeetingProvider = ({ children }) => {
  const [meetings, setMeetings] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();
  const { addNotification } = useNotifications() || {};

  const loadMeetings = async () => {
    if (!user) {
      setMeetings([]);
      setIsLoaded(true);
      return;
    }
    try {
      const data = await meetingService.fetchMeetings();
      // Map MongoDB _id configuration
      const mapped = (data || []).map(m => ({
        ...m,
        id: m._id || m.id,
        status: calculateStatus(m.date, m.time, m.duration),
        notificationsSent: m.notificationsSent || []
      }));
      setMeetings(mapped);
    } catch (err) {
      console.error('Error loading meetings:', err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [user]);

  // Interval for Reminders and Status Updates (remains client-side for immediate toast feedback)
  useEffect(() => {
    if (!isLoaded || meetings.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      let hasChanges = false;

      const updatedMeetings = meetings.map(meeting => {
        if (!meeting.date || !meeting.time) return meeting;

        let changed = false;
        const newMeeting = { ...meeting };
        if (!newMeeting.notificationsSent) newMeeting.notificationsSent = [];

        const meetingStart = new Date(`${meeting.date}T${meeting.time}`);
        const newStatus = calculateStatus(meeting.date, meeting.time, meeting.duration);

        if (newStatus !== meeting.status) {
          newMeeting.status = newStatus;
          changed = true;

          if (newStatus === 'Completed' && !newMeeting.notificationsSent.includes('Completed') && addNotification) {
            addNotification('system', 'Meeting Completed', `Your meeting "${meeting.title}" has concluded.`);
            newMeeting.notificationsSent.push('Completed');
          }
        }

        // Reminders
        if (newStatus === 'Scheduled') {
          const diffMs = meetingStart - now;
          const diffMins = Math.floor(diffMs / 60000);

          if (now.toDateString() === meetingStart.toDateString() && !newMeeting.notificationsSent.includes('Today') && addNotification) {
            addNotification('calendar', 'Meeting Today', `You have a meeting "${meeting.title}" scheduled for today at ${meeting.time}.`);
            newMeeting.notificationsSent.push('Today');
            changed = true;
          }

          if (diffMins <= 30 && diffMins > 0 && !newMeeting.notificationsSent.includes('30Min') && addNotification) {
            addNotification('calendar', 'Meeting in 30 Minutes', `Your meeting "${meeting.title}" starts in 30 minutes.`);
            newMeeting.notificationsSent.push('30Min');
            changed = true;
          }

          if (diffMins <= 0 && diffMins > -5 && !newMeeting.notificationsSent.includes('Now') && addNotification) {
            addNotification('calendar', 'Meeting Starts Now', `Your meeting "${meeting.title}" is starting now!`);
            newMeeting.notificationsSent.push('Now');
            changed = true;
          }
        }

        if (changed) hasChanges = true;
        return newMeeting;
      });

      if (hasChanges) {
        setMeetings(updatedMeetings);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [meetings, isLoaded, addNotification]);

  const addMeeting = async (meetingData) => {
    try {
      const res = await meetingService.scheduleMeeting(meetingData);
      if (res.success && res.meeting) {
        const mapped = {
          ...res.meeting,
          id: res.meeting._id || res.meeting.id,
          status: calculateStatus(res.meeting.date, res.meeting.time, res.meeting.duration),
          notificationsSent: []
        };
        setMeetings(prev => [mapped, ...prev]);
        return mapped;
      }
    } catch (err) {
      console.error('Error scheduling meeting:', err.message);
      throw err;
    }
  };

  const updateMeeting = async (id, updatedData) => {
    try {
      const updated = await meetingService.updateMeeting(id, updatedData);
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        status: calculateStatus(updated.date, updated.time, updated.duration)
      };
      setMeetings(prev => prev.map(m => (m._id === id || m.id === id) ? mapped : m));
    } catch (err) {
      console.error('Error updating meeting:', err.message);
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await meetingService.deleteMeeting(id);
      setMeetings(prev => prev.filter(m => m._id !== id && m.id !== id));
    } catch (err) {
      console.error('Error deleting meeting:', err.message);
    }
  };

  if (!isLoaded) return null;

  return (
    <MeetingContext.Provider value={{ meetings, addMeeting, updateMeeting, deleteMeeting, refreshMeetings: loadMeetings }}>
      {children}
    </MeetingContext.Provider>
  );
};
