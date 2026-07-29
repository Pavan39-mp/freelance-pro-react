import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useWorkspaceActions } from '../../hooks/useWorkspaceActions';
import ProjectOverviewTab from './ProjectOverviewTab';
import ProjectTasksTab from './ProjectTasksTab';
import ProjectActivityTab from './ProjectActivityTab';
import ProjectFilesTab from './ProjectFilesTab';

const ProjectDrawer = ({ project, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useUser();
    const { deleteProjectCascade } = useWorkspaceActions();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!project) return null;

    const handleDelete = () => {
        deleteProjectCascade(project.id, project.title);
        onClose();
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-error/20 text-error';
            case 'Medium': return 'bg-secondary/20 text-secondary';
            case 'Low': return 'bg-primary/20 text-primary';
            default: return 'bg-surface-variant text-on-surface-variant';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-tertiary/20 text-tertiary';
            case 'In Progress': return 'bg-primary/20 text-primary';
            case 'To Do': return 'bg-outline/20 text-outline';
            case 'On Hold': return 'bg-error/20 text-error';
            default: return 'bg-surface-variant text-on-surface-variant';
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[80] transition-opacity animate-in fade-in"
                onClick={onClose}
            ></div>

            <div className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] md:max-w-[480px] bg-surface-container border-l border-outline-variant/20 shadow-2xl z-[90] flex flex-col animate-in slide-in-from-right duration-300">

                {/* Sticky Header */}
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start bg-surface-container-low/50 sticky top-0 z-10 shrink-0">
                    <div className="flex-1 pr-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(project.priority)}`}>
                                {project.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                        </div>
                        <h2 className="font-headline-md text-headline-sm text-on-surface leading-tight truncate">
                            {project.title}
                        </h2>
                        <p className="text-body-sm text-on-surface-variant mt-1 truncate">
                            Client: {project.clientName || (project.client && typeof project.client === 'object' ? project.client.fullName || project.client.name : project.client) || '—'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant rounded-full transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sticky Tabs Navigation */}
                <div className="flex px-6 border-b border-outline-variant/10 gap-6 bg-surface-container sticky top-[108px] z-10 shrink-0">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'tasks', label: 'Tasks' },
                        { id: 'activity', label: 'Activity' },
                        { id: 'files', label: 'Files' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 border-b-2 transition-colors text-body-sm shrink-0 ${activeTab === tab.id
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface-container-low/30">
                    {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
                    {activeTab === 'tasks' && <ProjectTasksTab project={project} />}
                    {activeTab === 'activity' && <ProjectActivityTab project={project} />}
                    {activeTab === 'files' && <ProjectFilesTab project={project} />}
                </div>

                {/* Sticky Footer */}
                <div className={`p-4 border-t border-outline-variant/10 bg-surface-container-high shrink-0 grid ${user?.role === 'client' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3 sticky bottom-0 z-10`}>
                    {user?.role !== 'client' && (
                        <button
                            onClick={handleDelete}
                            className="py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl font-label-caps text-[11px] uppercase font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Project
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="py-2.5 bg-surface-variant/50 hover:bg-surface-variant text-on-surface rounded-xl font-label-caps text-[11px] uppercase font-bold transition-all active:scale-95 duration-200"
                    >
                        Close Drawer
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProjectDrawer;
