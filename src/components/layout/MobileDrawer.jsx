import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Rocket, FileText, ReceiptIndianRupee, Settings, X, LogOut, Bell, MessageSquare } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MobileDrawer = ({ isOpen, onClose }) => {
    const drawerRef = useRef(null);
    const { logout, user } = useUser();
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            // Lock body scroll
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const navItems = [
        { name: 'Messages', path: '/freelancer/messages', icon: MessageSquare },
        { name: 'Notes', path: '/freelancer/notes', icon: FileText },
        { name: 'Invoices', path: '/freelancer/invoices', icon: ReceiptIndianRupee },
        { name: 'Notifications', path: '/freelancer/notifications', icon: Bell },
    ];

    const handleLogout = async () => {
        onClose();
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed inset-y-0 left-0 w-[280px] max-w-[80vw] bg-surface-container-low dark:bg-surface-container-lowest shadow-2xl z-[70] md:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <Rocket className="text-on-primary w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="font-headline-sm text-lg font-black text-primary tracking-tight truncate">FreelancePro</h1>
                            <p className="font-label-caps text-[10px] text-on-surface-variant opacity-70 truncate line-clamp-1">
                                {user?.company || 'Creative Labs'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-6 pb-2">
                        <p className="text-[11px] font-label-caps text-on-surface-variant tracking-wider font-bold mb-3">MORE TOOLS</p>
                    </div>
                    <nav className="flex flex-col space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-6 py-3.5 transition-colors ${isActive
                                        ? 'bg-primary-container/20 text-primary border-l-4 border-primary'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 border-l-4 border-transparent'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-label-caps text-xs">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-outline-variant/10 space-y-2">
                    <NavLink
                        to="/freelancer/settings"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-surface-variant/50 text-primary'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                            }`
                        }
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-label-caps text-xs">Settings</span>
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors focus:outline-none"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-label-caps text-xs">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default MobileDrawer;
