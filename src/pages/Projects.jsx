import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useTasks } from '../context/TaskContext';
import { useUser } from '../context/UserContext';
import { useWorkspaceActions } from '../hooks/useWorkspaceActions';
import { MoreVertical, Calendar, Flag, Clock, Plus, Trash2, Target, Search, ChevronLeft, ChevronRight, IndianRupee, ArrowRight } from 'lucide-react';
import AddProjectForm from '../components/forms/AddProjectForm';
import Card from '../components/ui/Card';
import ProjectDrawer from '../components/projects/ProjectDrawer';

const Projects = () => {
  const location = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (location.state?.openAddForm) {
      setShowAddForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Ensure latest data is pulled when navigating to this page
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('refresh-projects'));
  }, []);

  const {
    projects,
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
    totalCount
  } = useProjects();

  const { tasks } = useTasks();
  const { deleteProjectCascade } = useWorkspaceActions();
  const [selectedProject, setSelectedProject] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-tertiary/20 text-tertiary';
      case 'In Progress': return 'bg-primary/20 text-primary';
      case 'To Do': return 'bg-outline/20 text-outline';
      case 'On Hold': return 'bg-error/20 text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const handleDelete = (id, name) => {
    deleteProjectCascade(id, name);
  };

  const renderColumn = (title, columnStatus) => {
    const colProjects = projects?.filter(p => p.status === columnStatus) || [];
    return (
      <div className="flex-1 min-w-[18.75rem] flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{title} <span className="text-on-surface-variant text-body-sm ml-2">{colProjects.length}</span></h3>
        </div>
        <div className="space-y-4">
          {colProjects?.map(project => {

            // Get tasks for this project
            const projectTasks = (tasks || []).filter(task => {
              const tProjId = task.projectId && typeof task.projectId === 'object' ? task.projectId._id : task.projectId;
              return tProjId === project.id || tProjId === project._id;
            });

            // Hours
            const sumWorked = projectTasks.reduce(
              (sum, task) => sum + (task.workedHours || 0),
              0
            );

            const sumEstimated = projectTasks.reduce(
              (sum, task) => sum + (task.estimatedHours || 0),
              0
            );

            // Progress
            const projectProgress = project.progress || 0;

            // Page stats
            const totalTasks = projectTasks.length;

            const completedTasks = projectTasks.filter(
              task => task.progress === 100
            ).length;

            return (
              <Card
                key={project.id}
                className="p-[1.25rem] cursor-pointer hover:shadow-md transition-all group flex flex-col gap-4"
                onClick={() => setSelectedProject(project)}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {user?.role !== 'client' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id, project.title);
                      }}
                      className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title & Client */}
                <div>
                  <h4 className="font-body-lg font-semibold text-on-surface mb-1">{project.title}</h4>
                  <p className="text-body-sm text-on-surface-variant font-medium">{project.clientName || project.client?.fullName || project.client?.name || ''}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-surface-variant/30 p-2.5 rounded-xl border border-outline-variant/10">
                    <p className="text-[10px] text-on-surface-variant font-bold tracking-wider mb-1">Tasks</p>
                    <p className="text-body-md font-bold text-on-surface">{completedTasks} / {totalTasks}</p>
                  </div>
                  <div className="bg-surface-variant/30 p-2.5 rounded-xl border border-outline-variant/10">
                    <p className="text-[10px] text-on-surface-variant font-bold tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Tracked
                    </p>
                    <p className="text-body-md font-bold text-on-surface">
                      {sumWorked} <span className="text-body-sm text-on-surface-variant font-normal">/ {sumEstimated}h</span>
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
                    <span className="text-on-surface-variant flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> True Progress
                    </span>
                    <span className="text-primary">{projectProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${projectProgress}%` }}></div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-bold tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.deadline || 'No deadline'}
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-bold tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {sumWorked} / {sumEstimated}h Total
                    </div>
                  </div>

                  <div className="flex -space-x-2 relative group/team">
                    {[1, 2].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?u=${project.id}-${i}`} alt="Team" className="w-7 h-7 rounded-full border-2 border-surface object-cover relative z-10 hover:z-20 transition-transform hover:-translate-y-1" />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
          {colProjects.length === 0 && (
            <div className="p-6 text-center border border-dashed border-outline-variant/20 rounded-2xl">
              <p className="text-body-sm text-on-surface-variant">No projects {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderClientCard = (project) => {
    // Project Progress from Context, or calculate fallback
    const progress = project.progress || 0;

    // Freelancer resolution
    const freelancerId = project.createdBy?._id || project.createdBy || 'unknown';
    const freelancerName = project.createdBy?.fullName || project.createdBy?.name || 'Assigned Freelancer';
    const avatarUrl = project.createdBy?.avatar || `https://i.pravatar.cc/150?u=${freelancerId}`;

    return (
      <Card
        key={project.id}
        className="p-[1.5rem] cursor-pointer hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-outline-variant/10 relative overflow-hidden"
        onClick={() => setSelectedProject(project)}
      >
        {/* subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>

        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <div className="text-on-surface-variant font-medium text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Title and Freelancer Info */}
        <div className="mb-6 relative z-10 flex-grow">
          <h4 className="font-display-sm text-xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">{project.title}</h4>

          <div className="flex items-center gap-3 bg-surface-container-low/50 p-3 rounded-2xl border border-outline-variant/10">
            <img src={avatarUrl} alt={freelancerName} className="w-10 h-10 rounded-full border-2 border-surface object-cover shadow-sm" />
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase mb-0.5">Freelancer</p>
              <p className="text-body-sm font-semibold text-on-surface leading-none">{freelancerName}</p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6 relative z-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Overall Progress</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10 relative z-10 mb-4">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase mb-1">Budget</p>
            <p className="flex items-center gap-1 text-on-surface font-bold">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
              {(project.budget || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase mb-1">Deadline</p>
            <p className="flex items-center gap-1.5 text-on-surface font-bold">
              <Calendar className="w-3.5 h-3.5 text-tertiary" />
              {project.deadline || project.dueDate ? new Date(project.deadline || project.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <button
          className="w-full mt-auto py-3 bg-surface-container hover:bg-surface-variant text-on-surface rounded-xl font-label-caps text-label-caps font-bold transition-colors flex items-center justify-center gap-2 group/btn relative z-10"
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
        </button>
      </Card>
    );
  };

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Projects</h2>
          <p className="text-on-surface-variant font-body-lg">Manage your active projects and track calculated progress.</p>
        </div>
        {user?.role !== 'client' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-label-caps text-label-caps font-bold active:scale-95 duration-200"
          >
            <Plus className="w-[1.125rem] h-[1.125rem]" />
            Add Project
          </button>
        )}
      </div>

      {/* Query Filter Toolbar */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-[50%] -translate-y-[50%] w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 pl-9 pr-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
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
          className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="budget-desc">Budget High-Low</option>
          <option value="budget-asc">Budget Low-High</option>
        </select>
      </div>

      {user?.role === 'client' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {projects.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-outline-variant/20 rounded-3xl bg-surface-container-low/30">
              <p className="text-body-lg text-on-surface-variant">No projects found. Send a Project Request to a Freelancer to get started.</p>
            </div>
          ) : (
            projects.map(project => renderClientCard(project))
          )}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-[37.5rem]">
          {renderColumn('To Do', 'To Do')}
          {renderColumn('In Progress', 'In Progress')}
          {renderColumn('On Hold', 'On Hold')}
          {renderColumn('Completed', 'Completed')}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="mt-8 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalCount)}</span> of <span className="font-bold text-on-surface">{totalCount}</span> Projects
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

      {showAddForm && <AddProjectForm onClose={() => setShowAddForm(false)} />}

      {/* Project Details Drawer */}
      {selectedProject && (
        <ProjectDrawer
          project={projects.find(p => p.id === selectedProject.id || p._id === selectedProject._id)}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default Projects;
