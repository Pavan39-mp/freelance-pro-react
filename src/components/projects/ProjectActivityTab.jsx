import React from 'react';
import { useActivities } from '../../context/ActivityContext';
import { useTasks } from '../../context/TaskContext';
import {
    Folder, CheckCircle2, Clock, AlertCircle,
    Plus, Users, Trash2, Edit2, Circle, Settings, Video
} from 'lucide-react';

const iconMap = {
    Users: Users,
    Folder: Folder,
    CheckCircle2: CheckCircle2,
    Video: Video,
    Settings: Settings,
    Clock: Clock,
    Plus: Plus,
    Trash2: Trash2,
    Edit2: Edit2,
    Circle: Circle,
    AlertCircle: AlertCircle
};

const ProjectActivityTab = ({ project }) => {
    const { activities } = useActivities();
    const { tasks } = useTasks();

    const projectTasks = (tasks || []).filter(t => t.projectId === project.id || t.projectId === project._id);
    const taskNames = projectTasks.map(t => (t.title || '').toLowerCase());
    const projectTitle = (project.title || '').toLowerCase();

    // Filter activities for this project + its tasks
    const projectActivities = activities.filter(act => {
        if (act.type === 'project') {
            return (act.taskName || '').toLowerCase() === projectTitle;
        }
        if (act.type === 'task') {
            return taskNames.includes((act.taskName || '').toLowerCase());
        }
        return false;
    });

    // Grouping logic
    const groupActivities = (list) => {
        const today = [];
        const yesterday = [];
        const earlier = [];

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

        list.forEach(act => {
            const actDate = act.createdAt ? new Date(act.createdAt) : new Date();
            if (actDate >= startOfToday) {
                today.push(act);
            } else if (actDate >= startOfYesterday) {
                yesterday.push(act);
            } else {
                earlier.push(act);
            }
        });

        return { today, yesterday, earlier };
    };

    const { today, yesterday, earlier } = groupActivities(projectActivities);

    const renderActivityGroup = (title, items) => {
        if (items.length === 0) return null;

        return (
            <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
                    {title}
                </h4>
                <div className="relative border-l border-outline-variant/20 ml-3 pl-4 space-y-5">
                    {items.map((act) => {
                        const Icon = iconMap[act.icon] || Settings;
                        return (
                            <div key={act.id} className="relative group flex gap-3.5">
                                {/* Node Bullet */}
                                <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-surface-container border-2 border-primary flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>

                                <div className="bg-surface-container-high p-3 rounded-xl border border-outline-variant/10 shadow-sm flex-1 flex gap-3 items-start">
                                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-baseline gap-2">
                                            <p className="font-bold text-body-sm text-on-surface">
                                                {act.title}
                                            </p>
                                            <span className="text-[9px] text-on-surface-variant font-medium shrink-0 uppercase tracking-wider">
                                                {act.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-body-sm text-on-surface-variant mt-0.5">
                                            {act.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
            {projectActivities.length > 0 ? (
                <>
                    {renderActivityGroup('Today', today)}
                    {renderActivityGroup('Yesterday', yesterday)}
                    {renderActivityGroup('Earlier', earlier)}
                </>
            ) : (
                <div className="text-center py-12 text-on-surface-variant">
                    <Settings className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-body-sm">No activity logged for this project yet.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectActivityTab;
