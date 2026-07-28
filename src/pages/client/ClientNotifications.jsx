import React from 'react';
import { Bell } from 'lucide-react';

const ClientNotifications = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline-md text-2xl font-bold text-on-surface">Notifications</h1>
                <p className="text-on-surface-variant text-body-sm mt-1">Stay updated on your projects and requests</p>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center mb-6">
                    <Bell className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-3">No Notifications Yet</h2>
                <p className="text-on-surface-variant text-body-sm max-w-md leading-relaxed">
                    Project updates, freelancer responses, messages, and deadline reminders will appear here.
                </p>
            </div>
        </div>
    );
};

export default ClientNotifications;
