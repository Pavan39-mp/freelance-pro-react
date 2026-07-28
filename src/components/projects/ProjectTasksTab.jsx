import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useTasks } from '../../context/TaskContext';
import { Search, Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import TaskDetailsDrawer from '../ui/TaskDetailsDrawer';

const ProjectTasksTab = ({ project }) => {
    const { user } = useUser();
    const { tasks, updateTask } = useTasks();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [activeTask, setActiveTask] = useState(null);

    const projectTasks = (tasks || []).filter(t => t.projectId === project.id || t.projectId === project._id);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress').length;
    const toDoTasks = projectTasks.filter(t => ['To Do', 'Pending', 'New', 'Not Started'].includes(t.status)).length;
    const onHoldTasks = projectTasks.filter(t => ['On Hold', 'Paused'].includes(t.status)).length;

    const filteredTasks = projectTasks.filter(task => {
        const matchesSearch = (task.title || '').toLowerCase().includes(search.toLowerCase());

        let mappedStatus = task.status;
        if (['Pending', 'New', 'Not Started'].includes(task.status)) mappedStatus = 'To Do';
        if (['Paused'].includes(task.status)) mappedStatus = 'On Hold';

        if (filter === 'All') return matchesSearch;
        return matchesSearch && mappedStatus === filter;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-error/20 text-error';
            case 'Normal': return 'bg-primary/20 text-primary';
            case 'Low': return 'bg-surface-variant text-on-surface-variant';
            default: return 'bg-surface-variant text-on-surface-variant';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-4 h-4 text-tertiary" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-primary" />;
            case 'On Hold': return <AlertCircle className="w-4 h-4 text-error" />;
            default: return <Circle className="w-4 h-4 text-outline" />;
        }
    };

    const handleQuickStatusChange = async (taskId, newStatus) => {
        try {
            await updateTask(taskId, { status: newStatus });
        } catch (err) {
            console.error(err);
        }
    };

    const handleQuickProgressChange = async (taskId, newProgress) => {
        try {
            await updateTask(taskId, { progress: Number(newProgress) });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">

            {/* Aggregated Totals Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                    <p className="text-[9px] uppercase font-bold text-on-surface-variant">Overall Progress</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold font-headline-sm">{project.progress || 0}%</span>
                        <span className="text-[10px] text-on-surface-variant">({completedTasks}/{totalTasks})</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-primary" style={{ width: `${project.progress || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/10 grid grid-cols-4 gap-1 text-center">
                    <div className="flex flex-col justify-between py-0.5 border-r border-outline-variant/10">
                        <span className="text-[8px] uppercase font-bold text-on-surface-variant truncate">To Do</span>
                        <span className="text-base font-bold text-outline">{toDoTasks}</span>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 border-r border-outline-variant/10">
                        <span className="text-[8px] uppercase font-bold text-on-surface-variant truncate">In Progress</span>
                        <span className="text-base font-bold text-primary">{inProgressTasks}</span>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 border-r border-outline-variant/10">
                        <span className="text-[8px] uppercase font-bold text-on-surface-variant truncate">On Hold</span>
                        <span className="text-base font-bold text-error">{onHoldTasks}</span>
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                        <span className="text-[8px] uppercase font-bold text-on-surface-variant truncate">Completed</span>
                        <span className="text-base font-bold text-tertiary">{completedTasks}</span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
                    <input
                        type="text"
                        placeholder="Search project tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 pl-9 pr-4 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {['All', 'To Do', 'In Progress', 'On Hold', 'Completed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-3 py-1 rounded-lg text-body-sm transition-all focus:outline-none font-medium shrink-0 ${filter === tab
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface-variant/40 hover:bg-surface-variant text-on-surface-variant'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <div
                            key={task.id || task._id}
                            className="p-3.5 bg-surface-container-low/40 hover:bg-surface-container-high/50 rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 transition-all flex flex-col gap-2.5 cursor-pointer group"
                            onClick={() => {
                                const latestTask = tasks.find(t => t.id === task.id || t._id === task._id);
                                setActiveTask(latestTask || task);
                            }}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <span className="mt-0.5 shrink-0">{getStatusIcon(task.status)}</span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-body-sm text-on-surface truncate group-hover:text-primary transition-colors">
                                            {task.title}
                                        </p>
                                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            {task.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {task.deadline}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Status Dropdown */}
                                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                                    <select
                                        value={task.status}
                                        disabled={user?.role === 'client'}
                                        onChange={(e) => handleQuickStatusChange(task.id || task._id, e.target.value)}
                                        className="bg-surface-container border border-outline-variant/30 rounded-lg text-[10px] py-1 px-1.5 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Progress Slider */}
                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                                        <span>Progress</span>
                                        <span>{task.progress || 0}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={task.progress || 0}
                                        disabled={user?.role === 'client'}
                                        onChange={(e) => handleQuickProgressChange(task.id || task._id, e.target.value)}
                                        className="w-full accent-primary h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                                    />
                                </div>
                                {task.estimatedHours > 0 && (
                                    <div className="text-right shrink-0 flex flex-col justify-end">
                                        <span className="text-[10px] font-bold text-on-surface">{(task.workedHours || 0)}/{task.estimatedHours}h</span>
                                        <span className="text-[8px] text-on-surface-variant uppercase font-bold tracking-wider">Worked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-on-surface-variant">
                        <p className="text-body-sm">No tasks found.</p>
                    </div>
                )}
            </div>

            {activeTask && (
                <TaskDetailsDrawer
                    task={tasks.find(t => t.id === activeTask.id || t._id === activeTask._id)}
                    onClose={() => setActiveTask(null)}
                />
            )}
        </div>
    );
};

export default ProjectTasksTab;
