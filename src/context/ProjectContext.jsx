import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as projectService from '../services/projectService';
import { useNotifications } from './NotificationContext';
import { useTasks } from './TaskContext';
import { useUser } from './UserContext';
import { useFilterPipeline } from '../hooks/useFilterPipeline';
import toast from 'react-hot-toast';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [rawProjects, setRawProjects] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();
  const [client, setClient] = useState('All');

  const { addNotification } = useNotifications() || {};

  // Safe extraction of tasks, defaults to empty array if Context is not ready yet
  const { tasks } = useTasks() || { tasks: [] };

  // Memoize config to prevent infinite render loops in the pipeline hook
  const pipelineConfig = useMemo(() => ({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    searchLogic: (project, q) => (project.title || '').toLowerCase().includes(q.toLowerCase()) ||
      (project.clientName || '').toLowerCase().includes(q.toLowerCase()),
    statusLogic: (project, s) => project.status === s,
    priorityLogic: (project, p) => project.priority === p,
    otherFiltersLogic: (project, filters) => {
      if (filters.client && filters.client !== 'All') {
        const cId = project.client?._id || project.client;
        return cId === filters.client || project.clientName === filters.client;
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
    paginatedData: projects,
    totalCount,
    totalPages
  } = useFilterPipeline(rawProjects, pipelineConfig);

  useEffect(() => {
    setOtherFilters(prev => ({ ...prev, client }));
  }, [client, setOtherFilters]);

  const loadProjects = async () => {
    if (!user) {
      setRawProjects([]);
      setIsLoaded(true);
      return;
    }
    try {
      // Fetch all projects unconditionally for the local pipeline
      const res = await projectService.getProjects({ paginate: 'false' });

      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.items)) {
        items = res.items;
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
      }

      const mapped = items.map(p => {
        const activeClient = p.client || p.platformClient;
        let clientName = '';
        if (activeClient && typeof activeClient === 'object') {
          clientName = activeClient.fullName || activeClient.name || '';
        }
        return {
          ...p,
          id: p._id,
          title: p.title || p.name,
          client: activeClient,
          clientName: clientName
        };
      });
      setRawProjects(mapped || []);
    } catch (err) {
      console.error('Error loading projects:', err.message || err);
      toast.error(err.message || 'Server Error');
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadProjects();

    const handleRefresh = () => loadProjects();
    window.addEventListener('refresh-projects', handleRefresh);
    return () => window.removeEventListener('refresh-projects', handleRefresh);
  }, [user]);

  const addProject = async (projectData) => {
    try {
      const payload = {
        ...projectData,
        name: projectData.title
      };

      const newProject = await projectService.createProject(payload);

      const projectTitle = newProject.name || '';
      let clientName = '';
      if (newProject.client && typeof newProject.client === 'object') {
        clientName = newProject.client.fullName || newProject.client.name || '';
      }

      const mappedNewProject = {
        ...newProject,
        id: newProject._id,
        title: projectTitle,
        client: newProject.client,
        clientName: clientName
      };

      setRawProjects(prev => [mappedNewProject, ...prev]);

      toast.success('Project Created');

      window.dispatchEvent(new CustomEvent('refresh-clients'));

      if (addNotification) {
        addNotification('project', 'New Project Created', `Project "${projectTitle}" has been created for ${clientName}.`);
      }

      return mappedNewProject;
    } catch (err) {
      console.error('Error adding project:', err.message || err);
      toast.error(err.message || 'Server Error');
      throw err;
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const payload = { ...updates };
      if (updates.title) payload.name = updates.title;

      const updated = await projectService.updateProject(id, payload);

      const projectTitle = updated.name || '';
      let clientName = '';
      if (updated.client && typeof updated.client === 'object') {
        clientName = updated.client.fullName || updated.client.name || '';
      }

      const mappedUpdated = {
        ...updated,
        id: updated._id,
        title: projectTitle,
        client: updated.client,
        clientName: clientName
      };

      setRawProjects(prev => {
        const newProjects = prev.map(p => (p._id === id || p.id === id) ? mappedUpdated : p);

        const oldProject = prev.find(p => p._id === id || p.id === id);
        if (oldProject && oldProject.status !== 'Completed' && updates.status === 'Completed' && addNotification) {
          addNotification('project', 'Project Completed', `Project "${oldProject.title}" has been marked as completed!`);
        }
        return newProjects;
      });

      toast.success('Project Updated');

      window.dispatchEvent(new CustomEvent('refresh-clients'));

      return mappedUpdated;
    } catch (err) {
      console.error('Error updating project:', err.message || err);
      toast.error(err.message || 'Server Error');
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      setRawProjects(prev => prev.filter(p => p._id !== id && p.id !== id));
      toast.success('Project Deleted');

      window.dispatchEvent(new CustomEvent('refresh-clients'));
    } catch (err) {
      console.error('Error deleting project:', err.message || err);
      toast.error(err.message || 'Server Error');
      throw err;
    }
  };

  const deleteProjectsByClient = (clientId) => {
    setRawProjects(prev => prev.filter(p => {
      const pClientId = p.client && typeof p.client === 'object' ? p.client._id : p.client;
      return pClientId !== clientId;
    }));
  };

  // Centralized Dynamic Calculation over the sorted paginated data
  const enrichedProjects = useMemo(() => {
    return projects.map(p => {
      const id = p._id || p.id;
      // Filter tasks by project name or PROJECT ID
      const projectTasks = tasks.filter(t => {
        const taskProjectId = t.projectId?._id || t.projectId;
        return String(taskProjectId || '') === String(id) || t.project === p.title;
      });

      let sumEstimated = 0;
      let sumWorked = 0;
      let completedTasks = 0;
      let pendingTasks = 0;
      let inProgressTasks = 0;

      projectTasks.forEach(t => {
        sumEstimated += (t.estimatedHours || 0);
        sumWorked += (t.workedHours || 0);

        if (t.status === 'Completed') completedTasks++;
        else if (t.status === 'In Progress') inProgressTasks++;
        else pendingTasks++;
      });

      const totalTasks = projectTasks.length;
      // Use persisted backend progress when tasks are unavailable to the current role.
      let progress = p.progress || 0;
      if (totalTasks > 0) {
        progress = sumEstimated > 0
          ? Math.min(100, Math.round((sumWorked / sumEstimated) * 100))
          : 0;
      }

      const remainingHours = Math.max(0, sumEstimated - sumWorked);
      const hoursVariance = Math.abs(sumEstimated - sumWorked);
      const timeEfficiency = sumWorked > sumEstimated
        ? `${hoursVariance}h over estimate`
        : sumWorked < sumEstimated
          ? `${hoursVariance}h under estimate`
          : 'On estimate';

      return {
        ...p,
        id,
        _id: id,
        progress,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        estimatedHours: sumEstimated,
        workedHours: sumWorked,
        trackedHours: sumWorked,
        timeEfficiency,
        remainingHours
      };
    });
  }, [projects, tasks]);

  if (!isLoaded) return null;

  return (
    <ProjectContext.Provider value={{
      projects: enrichedProjects,
      page, setPage,
      limit, setLimit,
      search, setSearch,
      status, setStatus,
      priority, setPriority,
      client, setClient,
      sortBy, setSortBy,
      sortOrder, setSortOrder,
      totalPages, totalCount,
      addProject, updateProject,
      deleteProject, deleteProjectsByClient,
      fetchProject: projectService.fetchProject,
      refreshProjects: loadProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
