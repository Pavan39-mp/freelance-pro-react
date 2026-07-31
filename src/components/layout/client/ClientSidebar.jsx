import React from 'react';
import { NavLink } from 'react-router-dom';
import { Rocket, LayoutDashboard, Search, Briefcase, ClipboardList, MessageSquare, Bell, Settings, ReceiptIndianRupee, Video, PlusCircle } from 'lucide-react';

const ClientSidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/client-dashboard', icon: LayoutDashboard },
    { name: 'Find Freelancers', path: '/client/find-freelancers', icon: Search },
    { name: 'My Projects', path: '/client/projects', icon: Briefcase },
    { name: 'Create Project Request', path: '/client/create-project-request', icon: PlusCircle },
    { name: 'Invoices', path: '/client/invoices', icon: ReceiptIndianRupee },
    { name: 'Project Requests', path: '/client/project-requests', icon: ClipboardList },
    { name: 'Messages', path: '/client/messages', icon: MessageSquare },
    { name: 'Meetings', path: '/client/meetings', icon: Video },
    { name: 'Notifications', path: '/client/notifications', icon: Bell },
  ];

  return (
    <aside className="fixed h-screen w-[260px] left-0 top-0 hidden md:flex flex-col py-6 bg-surface-container-low dark:bg-surface-container-lowest/80 backdrop-blur-xl z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Rocket className="text-on-primary w-5 h-5" />
        </div>
        <div>
          <h1 className="font-headline-sm text-headline-sm font-black text-primary tracking-tight">FreelancePro</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant opacity-70">Creative Labs</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-all duration-300 ${isActive
                ? 'bg-primary-container/20 text-primary border-r-4 border-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="font-label-caps text-label-caps">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-6 space-y-4">
        <div className="pt-4 space-y-1">
          <NavLink
            to="/client/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 transition-all duration-300 rounded-lg ${isActive
                ? 'bg-surface-variant/50 text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`
            }
          >
            <Settings className="w-6 h-6" />
            <span className="font-label-caps text-label-caps">Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default ClientSidebar;
