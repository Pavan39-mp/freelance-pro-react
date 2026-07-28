import React, { createContext, useState, useContext, useEffect } from 'react';
import * as notificationService from '../services/notificationService';
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setIsLoaded(true);
      return;
    }
    try {
      const queryParams = {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        paginate: 'true'
      };
      const res = await notificationService.fetchNotifications(queryParams);

      let items = [];
      if (Array.isArray(res)) {
        items = res;
        setTotalPages(1);
        setTotalCount(res.length);
      } else if (res && Array.isArray(res.items)) {
        items = res.items;
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
        setTotalPages(1);
        setTotalCount(res.data.length);
      }

      const mapped = items.map(n => ({
        ...n,
        id: n._id || n.id,
        content: n.message || n.content,
        time: n.createdAt ? new Date(n.createdAt) : new Date()
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('Error loading notifications:', err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user, page, limit, search, sortBy, sortOrder]);

  // Read-only on client; backend automatically creates notifications on actions
  const addNotification = async (type, title, content, metadata = {}) => {
    // Refresh to pull newly created backend notifications
    await loadNotifications();
  };

  const markAsRead = async (id) => {
    try {
      const updated = await notificationService.markNotificationRead(id);
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        content: updated.message || updated.content,
        time: updated.createdAt ? new Date(updated.createdAt) : new Date()
      };
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? mapped : n));
    } catch (err) {
      console.error('Error marking read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const data = await notificationService.markAllNotificationsRead();
      const mapped = (data || []).map(n => ({
        ...n,
        id: n._id || n.id,
        content: n.message || n.content,
        time: n.createdAt ? new Date(n.createdAt) : new Date()
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('Error marking all read:', err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err.message);
    }
  };

  if (!isLoaded) return null;

  return (
    <NotificationContext.Provider value={{
      notifications,
      page,
      setPage,
      limit,
      setLimit,
      search,
      setSearch,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
      totalPages,
      totalCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications: loadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
