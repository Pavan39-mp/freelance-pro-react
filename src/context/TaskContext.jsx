import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as taskService from '../services/taskService';
import { useUser } from './UserContext';
import { useFilterPipeline } from '../hooks/useFilterPipeline';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [rawTasks, setRawTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();
  const [projectId, setProjectId] = useState('All');

  // Memoize config to prevent infinite render loops in the hook
  const pipelineConfig = useMemo(() => ({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    searchLogic: (task, q) => (task.title || '').toLowerCase().includes(q.toLowerCase()) ||
      (task.client || '').toLowerCase().includes(q.toLowerCase()) ||
      (task.project || '').toLowerCase().includes(q.toLowerCase()),
    statusLogic: (task, s) => {
      return task.status === s;
    },
    priorityLogic: (task, p) => task.priority === p,
    otherFiltersLogic: (task, filters) => {
      if (filters.projectId && filters.projectId !== 'All') {
        const pId = task.projectId?._id || task.projectId;
        return pId === filters.projectId || task.project === filters.projectId;
      }
      return true;
    }
  }), []);

  const {
    search, setSearch,
    status, setStatus,
    priority, setPriority,
    otherFilters, setOtherFilters,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    page, setPage,
    limit, setLimit,
    paginatedData: tasks,
    totalCount,
    totalPages
  } = useFilterPipeline(rawTasks, pipelineConfig);

  // Sync contextual projectId with pipeline otherFilters
  useEffect(() => {
    setOtherFilters(prev => ({ ...prev, projectId }));
  }, [projectId, setOtherFilters]);

  const loadTasks = async () => {
    if (!user) {
      setRawTasks([]);
      setIsLoaded(true);
      return;
    }
    try {
      // Fetch all tasks unconditionally, relying entirely on the local pipeline
      const res = await taskService.getTasks({ paginate: 'false' });

      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.items)) {
        items = res.items;
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
      }

      const mapped = items.map(t => {
        const proj = t.projectId || {};
        const cl = proj.platformClient || proj.client || {};
        return {
          ...t,
          id: t._id || t.id,
          project: proj.name || '',
          client: cl.fullName || cl.name || ''
        };
      });
      setRawTasks(mapped);
    } catch (err) {
      console.error('Error loading Tasks:', err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const addTask = async (taskData) => {
    try {
      const newTask = await taskService.addTask(taskData);
      const proj = newTask.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...newTask,
        id: newTask._id || newTask.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const updated = await taskService.updateTask(id, taskData);
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === id || t.id === id) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  const updateTaskProgress = async (id, newProgress, hoursWorked, summary, isBlocked, blockReason) => {
    try {
      const updated = await taskService.updateTaskProgress(id, {
        newProgress, hoursWorked, summary, isBlocked, blockReason
      });
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === id || t.id === id) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error updating progress:', err.message);
    }
  };

  const undoLastProgress = async (id) => {
    try {
      const updated = await taskService.undoLastProgress(id);
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === id || t.id === id) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error undoing progress:', err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setRawTasks(prev => prev.filter(t => t._id !== id && t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err.message);
    }
  };

  const addComment = async (taskId, text) => {
    try {
      const updated = await taskService.addComment(taskId, text);
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error adding comment:', err.message);
    }
  };

  const editComment = async (taskId, commentId, text) => {
    try {
      const updated = await taskService.editComment(taskId, commentId, text);
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error editing comment:', err.message);
    }
  };

  const deleteComment = async (taskId, commentId) => {
    try {
      const updated = await taskService.deleteComment(taskId, commentId);
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error deleting comment:', err.message);
    }
  };

  const addAttachment = async (taskId, fileData) => {
    try {
      const updated = await taskService.addAttachment(taskId, fileData);
      const proj = updated.projectId || {};
      const cl = proj.platformClient || proj.client || {};
      const mapped = {
        ...updated,
        id: updated._id || updated.id,
        project: proj.name || '',
        client: cl.fullName || cl.name || ''
      };
      setRawTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? mapped : t));
      return mapped;
    } catch (err) {
      console.error('Error adding attachment:', err.message);
    }
  };

  const deleteAttachment = async (taskId, attachmentId) => {
    try {
      const res = await taskService.deleteAttachment(taskId, attachmentId);
      if (res?.success) {
        setRawTasks(prev => prev.map(t => {
          if (t._id === taskId || t.id === taskId) {
            return {
              ...t,
              attachments: (t.attachments || []).filter(a => (a._id || a.id || a) !== attachmentId)
            };
          }
          return t;
        }));
        return true;
      }
    } catch (err) {
      console.error('Error deleting attachment:', err.message);
      throw err;
    }
  };

  const deleteTasksByProject = (projectId) => {
    setRawTasks(prev => prev.filter(t => {
      const tProjId = t.projectId?._id || t.projectId;
      return tProjId !== projectId;
    }));
  };

  const deleteTasksByClient = (clientId) => {
    setRawTasks(prev => prev.filter(t => {
      const clId = t.projectId?.client?._id || t.projectId?.client;
      return clId !== clientId;
    }));
  };

  if (!isLoaded) return null;

  return (
    <TaskContext.Provider value={{
      tasks,
      page, setPage,
      limit, setLimit,
      search, setSearch,
      status, setStatus,
      priority, setPriority,
      projectId, setProjectId,
      sortBy, setSortBy,
      sortOrder, setSortOrder,
      totalPages, totalCount,
      addTask, updateTask, updateTaskProgress,
      undoLastProgress, deleteTask, deleteTasksByProject,
      deleteTasksByClient, addComment, editComment, deleteComment,
      addAttachment, deleteAttachment,
      refreshTasks: loadTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};
