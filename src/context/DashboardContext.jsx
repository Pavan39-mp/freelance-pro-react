import React, { createContext, useContext, useMemo } from 'react';
import { useClients } from './ClientContext';
import { useProjects } from './ProjectContext';
import { useTasks } from './TaskContext';
import { useInvoices } from './InvoiceContext';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { invoices, revenueSummary } = useInvoices() || {};

  const dashboardData = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
    const activeTasks = tasks.filter(t => ['To Do', 'In Progress', 'Pending', 'New', 'Not Started'].includes(t.status)).length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalClients = clients.length;
    const totalProjects = projects.length;

    const productivityScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    let productivityLevel = 'Beginner';
    if (productivityScore > 80) productivityLevel = 'Elite';
    else if (productivityScore > 50) productivityLevel = 'Pro';
    else if (productivityScore > 20) productivityLevel = 'Active';

    const dynamicUpcomingDeadlines = tasks
      .filter(t => t.deadline && t.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3)
      .map(t => {
        const date = new Date(t.deadline);
        return {
          id: t.id,
          date: date.getDate(),
          month: date.toLocaleString('default', { month: 'short' }),
          title: t.title,
          client: t.client,
          priority: t.priority,
          opacity: '100'
        };
      });

    return {
      activeClients,
      inProgressProjects,
      activeTasks,
      completedTasks,
      totalClients,
      totalProjects,
      productivityScore,
      productivityLevel,
      dynamicUpcomingDeadlines,
      recentTasks: tasks
    };
  }, [clients, projects, tasks]);

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
};
