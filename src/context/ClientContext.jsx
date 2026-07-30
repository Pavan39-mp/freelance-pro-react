import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as clientService from '../services/clientService';
import { useProjects } from './ProjectContext';
import { useTasks } from './TaskContext';
import { useUser } from './UserContext';
import { useFilterPipeline } from '../hooks/useFilterPipeline';
import toast from 'react-hot-toast';

const ClientContext = createContext();

export const useClients = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [rawClients, setRawClients] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useUser();

  const { projects } = useProjects() || { projects: [] };
  const { tasks } = useTasks() || { tasks: [] };

  const pipelineConfig = useMemo(() => ({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    searchLogic: (client, q) => (client.name || '').toLowerCase().includes(q.toLowerCase()) ||
      (client.company || '').toLowerCase().includes(q.toLowerCase()) ||
      (client.industry || '').toLowerCase().includes(q.toLowerCase()),
    statusLogic: (client, s) => client.status === s
  }), []);

  const {
    search, setSearch,
    status, setStatus,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    page, setPage,
    limit, setLimit,
    paginatedData: clients,
    totalCount,
    totalPages
  } = useFilterPipeline(rawClients, pipelineConfig);

  const loadClients = async () => {
    if (!user || user.role === 'client') {
      setRawClients([]);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await clientService.getClients({ paginate: 'false' });

      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.items)) {
        items = res.items;
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
      }

      const mapped = items.map(c => ({
        ...c,
        name: c.fullName || c.name || '',
        id: c._id
      }));
      setRawClients(mapped || []);
    } catch (err) {
      console.error('Error loading clients:', err.message || err);
      toast.error(err.message || 'Server Error');
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadClients();
  }, [user]);

  useEffect(() => {
    const handleRefresh = () => loadClients();
    window.addEventListener('refresh-clients', handleRefresh);
    return () => window.removeEventListener('refresh-clients', handleRefresh);
  }, [user]);

  const enrichedClients = useMemo(() => {
    return clients.map(c => {
      const id = c._id || c.id;
      const clientName = c.fullName || c.name || '';

      const clientProjects = projects.filter(p => {
        const pClientId = p.platformClient?._id || p.platformClient || (p.client && typeof p.client === 'object' ? p.client._id : p.client);
        return pClientId?.toString() === id?.toString();
      });

      const clientTasks = tasks.filter(t => {
        const taskProject = t.projectId || {};
        const linkedClient = taskProject.platformClient || taskProject.client;
        const pClientId = linkedClient && typeof linkedClient === 'object'
          ? linkedClient._id
          : linkedClient;
        return pClientId?.toString() === id?.toString();
      });

      const totalProjects = c.projectCount ?? clientProjects.length;
      let activeProjects = 0;
      let completedProjects = 0;

      clientProjects.forEach(p => {
        if (p.status === 'Completed') completedProjects++;
        else activeProjects++;
      });

      let sumEstimatedHours = 0;
      let sumTrackedHours = 0;
      let activeTasks = 0;

      clientTasks.forEach(t => {
        sumEstimatedHours += (Number(t.estimatedHours) || 0);
        sumTrackedHours += (Number(t.workedHours) || 0);
        if (t.status !== 'Completed') activeTasks++;
      });

      const overallProgress = sumEstimatedHours > 0
        ? Math.min(100, Math.round((sumTrackedHours / sumEstimatedHours) * 100))
        : 0;

      let lifetimeBilling = 0;
      clientProjects.forEach(p => {
        if (p.hourlyRate > 0) {
          lifetimeBilling += (p.hourlyRate * (p.workedHours || 0));
        } else {
          lifetimeBilling += (p.budget || 0);
        }
      });

      return {
        ...c,
        id,
        _id: id,
        name: clientName,
        totalProjects,
        projectCount: totalProjects,
        activeProjects,
        completedProjects,
        overallProgress,
        activeTasks,
        lifetimeBilling
      };
    });
  }, [clients, projects, tasks]);

  if (!isLoaded) return null;

  return (
    <ClientContext.Provider value={{
      clients: enrichedClients,
      page, setPage,
      limit, setLimit,
      search, setSearch,
      status, setStatus,
      sortBy, setSortBy,
      sortOrder, setSortOrder,
      totalPages, totalCount,
      refreshClients: loadClients
    }}>
      {children}
    </ClientContext.Provider>
  );
};
