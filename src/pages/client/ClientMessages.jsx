import React from 'react';
import { MessageSquare } from 'lucide-react';

const ClientMessages = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline-md text-2xl font-bold text-on-surface">Messages</h1>
                <p className="text-on-surface-variant text-body-sm mt-1">Communicate directly with your freelancers</p>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-3">No Messages Yet</h2>
                <p className="text-on-surface-variant text-body-sm max-w-md leading-relaxed">
                    Once you connect with a freelancer or start a project, your conversations will appear here.
                </p>
            </div>
        </div>
    );
};

export default ClientMessages;
