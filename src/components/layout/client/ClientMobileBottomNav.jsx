import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Bell, Users, Briefcase, ClipboardList, BarChart2 } from 'lucide-react';

const ClientMobileBottomNav = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

    // Hide on scroll down, show on scroll up for a native app feel
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 60) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navItems = [
        { name: 'Home', path: '/client-dashboard', icon: LayoutDashboard },
        { name: 'Find', path: '/client/find-freelancers', icon: Users },
        { name: 'Projects', path: '/client/projects', icon: Briefcase },
        { name: 'Requests', path: '/client/project-requests', icon: ClipboardList },
        { name: 'Messages', path: '/client/messages', icon: MessageSquare },
    ];

    return (
        <div
            className={`md:hidden fixed bottom-1 left-4 right-4 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'
                } print:hidden`}
        >
            <nav className="flex items-center justify-between px-2 py-3 bg-surface-container-high/90 dark:bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full px-1 py-1 space-y-1 transition-all rounded-xl tap-highlight-transparent ${isActive
                                ? 'text-primary'
                                : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            <div className={`flex items-center justify-center p-1.5 rounded-full transition-all ${isActive ? 'bg-primary/20' : ''}`}>
                                <item.icon
                                    className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span
                                className={`text-[9px] font-label-caps tracking-wide ${isActive ? 'text-primary font-bold' : 'font-medium'
                                    }`}
                            >
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default ClientMobileBottomNav;
