import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useProjects } from '../context/ProjectContext';
import { CheckCircle2, Clock, Circle, AlertCircle, Calendar, Plus, Trash2, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AddTaskForm from '../components/forms/AddTaskForm';
import Card from '../components/ui/Card';
import TaskDetailsDrawer from '../components/ui/TaskDetailsDrawer';
import toast from 'react-hot-toast';

const Tasks = () => {
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const { projects = [] } = useProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];
  const today = new Date().toISOString().split('T')[0];
  const hasOpenProject = safeProjects.some(project => {
    const dueDate = String(project.dueDate || project.deadline || '').split('T')[0];
    return !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || today <= dueDate;
  });
  const taskCreationBlocked = safeProjects.length > 0 && !hasOpenProject;

  useEffect(() => {
    if (location.state?.openAddForm && !taskCreationBlocked) {
      setShowAddForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, taskCreationBlocked]);

  const {
    tasks,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    totalPages,
    totalCount,
    deleteTask,
    refreshTasks
  } = useTasks();

  const [activeTask, setActiveTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-error/20 text-error';
      case 'Medium': return 'bg-tertiary/20 text-tertiary';
      case 'Low': return 'bg-primary/20 text-primary';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusIcon = (status, isBlocked) => {
    if (isBlocked) return <AlertTriangle className="w-5 h-5 text-error" />;
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-tertiary" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-primary" />;
      case 'Overdue': return <AlertCircle className="w-5 h-5 text-error" />;
      case 'On Hold': return <AlertCircle className="w-5 h-5 text-error" />;
      default: return <Circle className="w-5 h-5 text-outline" />;
    }
  };

  const handleDelete = (e, id, title) => {
    e.stopPropagation(); // Prevent opening drawer
    setTaskToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      await refreshTasks();
      if (activeTask?.id === taskToDelete.id) setActiveTask(null);
      setTaskToDelete(null);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderColumn = (title) => {
    const colTasks = tasks.filter(t => {
      let mappedStatus = t.status;
      if (['Pending', 'New', 'Not Started'].includes(t.status)) mappedStatus = 'To Do';
      if (['Paused'].includes(t.status)) mappedStatus = 'On Hold';

      return mappedStatus === title;
    });

    return (
      <div className="w-full min-w-0 flex-none md:w-auto md:min-w-[18.75rem] md:flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{title} <span className="text-on-surface-variant text-body-sm ml-2">{colTasks.length}</span></h3>
        </div>
        <div className="space-y-4">
          {colTasks.map(task => (
            <Card
              key={task.id}
              onClick={() => setActiveTask(task)}
              className="p-[1.25rem] cursor-pointer hover:-translate-y-1 hover:shadow-xl group relative flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="text-on-surface-variant group-hover:text-primary transition-colors">
                    {getStatusIcon(task.status, task.isBlocked)}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, task.id, task.title)}
                  className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Info */}
              <div>
                <h4 className={`font-body-md font-semibold mb-1 ${task.isBlocked ? 'text-error' : 'text-on-surface'}`}>{task.title}</h4>
                <p className="text-label-caps text-on-surface-variant">{task.client} • {task.project}</p>
                {task.isBlocked && (
                  <p className="text-[10px] text-error mt-1 font-bold truncate">Blocked: {task.blockReason}</p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
                  <span className="text-on-surface-variant">Progress</span>
                  <span className="text-primary">{task.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${task.isBlocked ? 'bg-error' : task.progress === 100 ? 'bg-tertiary' : 'bg-primary'}`} style={{ width: `${task.progress || 0}%` }}></div>
                </div>
              </div>

              {/* Footer Metrics */}
              <div className="flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
                {task.deadline && (
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-bold tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className={(new Date(task.deadline) < new Date() && task.status !== 'Completed') ? 'text-error' : ''}>{task.deadline}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-bold tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.workedHours || 0} / {task.estimatedHours}h</span>
                </div>
              </div>
            </Card>
          ))}
          {colTasks.length === 0 && (
            <div className="p-6 text-center border border-dashed border-outline-variant/20 rounded-2xl">
              <p className="text-body-sm text-on-surface-variant">No tasks {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Tasks</h2>
          <p className="text-on-surface-variant font-body-lg">Manage tasks, update progress, and collaborate.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={taskCreationBlocked}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-label-caps text-label-caps font-bold active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-[1.125rem] h-[1.125rem]" />
            Add Task
          </button>
          {taskCreationBlocked && <p className="text-[10px] text-error">This project deadline has passed. New tasks cannot be created.</p>}
        </div>
      </div>

      {/* Query Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4 mb-6 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10">
        <div className="relative w-full min-w-0 md:flex-1 md:min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 pl-9 pr-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full md:w-auto bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full md:w-auto bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          className="w-full md:w-auto bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="progress-desc">Progress High-Low</option>
          <option value="progress-asc">Progress Low-High</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-6 overflow-visible md:overflow-x-auto pb-4 md:custom-scrollbar min-h-[31.25rem] min-w-0">
        {renderColumn('To Do')}
        {renderColumn('In Progress')}
        {renderColumn('Completed')}
        {renderColumn('On Hold')}
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="mt-8 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalCount)}</span> of <span className="font-bold text-on-surface">{totalCount}</span> Tasks
          </p>
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all disabled:opacity-30 disabled:hover:bg-transparent mr-2 shadow-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-body-sm font-bold text-on-surface px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all ml-2 shadow-sm font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showAddForm && <AddTaskForm onClose={() => setShowAddForm(false)} />}

      {taskToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-outline-variant/20 bg-surface-container-high p-6 shadow-2xl">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Delete Task</h3>
            <p className="mt-3 text-body-md text-on-surface-variant">Are you sure you want to delete this task?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface font-label-caps text-label-caps font-bold transition-colors hover:bg-surface-variant/50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-error text-on-error font-label-caps text-label-caps font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={tasks.find(t => t.id === activeTask?.id)} // Keep ref updated
        onClose={() => setActiveTask(null)}
      />
    </div>
  );
};

export default Tasks;
