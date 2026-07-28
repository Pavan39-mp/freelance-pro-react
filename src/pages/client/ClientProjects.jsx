import React from 'react';
import { Briefcase, PlusCircle } from 'lucide-react';

const ClientProjects = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline-md text-2xl font-bold text-on-surface">My Projects</h1>
                    <p className="text-on-surface-variant text-body-sm mt-1">Track and manage all your active projects</p>
                </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-tertiary/10 flex items-center justify-center mb-6">
                    <Briefcase className="w-10 h-10 text-tertiary" />
                </div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-3">No Projects Yet</h2>
                <p className="text-on-surface-variant text-body-sm max-w-md mb-8 leading-relaxed">
                    Your active projects with freelancers will appear here. Find a freelancer and create your first project to get started.
                </p>
                <div className="flex flex-wrap gap-3 justify-center text-sm text-on-surface-variant">
                    <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30">Project Status</span>
                    <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30">Progress Tracking</span>
                    <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30">Deadlines</span>
                    <span className="px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30">Budget</span>
                </div>
            </div>
        </div>
    );
};

export default ClientProjects;
