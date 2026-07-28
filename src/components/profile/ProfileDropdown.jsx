import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { User, Settings, Bell, LogOut } from 'lucide-react';

const ProfileDropdown = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  if (!user) return null; // Safe guard for async load

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3 pl-2 border-l border-outline-variant/20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-right hidden sm:block hover:opacity-80 transition-opacity focus:outline-none"
        >
          <p className="font-label-caps text-label-caps font-bold text-on-surface">{user.fullName}</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{user.role}</p>
        </button>
        <button
          onClick={() => handleNavigation(user?.role === 'client' ? '/client/settings' : '/freelancer/profile')}
          className="hover:opacity-80 transition-opacity focus:outline-none"
        >
          <img
            alt="User Profile"
            className="w-8 h-8 rounded-full border border-primary/30 object-cover"
            src={user.photo}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full  -right-2 sm:right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-outline-variant/10">
            <p className="font-label-caps text-label-caps text-on-surface">{user.fullName}</p>
            <p className="text-body-sm text-on-surface-variant">{user.email}</p>
          </div>

          <div className="py-2">
            <button
              onClick={() => handleNavigation(user?.role === 'client' ? '/client/settings' : '/freelancer/profile')}
              className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4 text-on-surface-variant" />
              My Profile
            </button>
            <button
              onClick={() => handleNavigation(user?.role === 'client' ? '/client/settings' : '/freelancer/settings')}
              className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4 text-on-surface-variant" />
              Settings
            </button>
            <button
              onClick={() => handleNavigation(user?.role === 'client' ? '/client/notifications' : '/freelancer/notifications')}
              className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3"
            >
              <Bell className="w-4 h-4 text-on-surface-variant" />
              Notifications
            </button>
          </div>

          <div className="py-2 border-t border-outline-variant/10">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-body-sm text-error hover:bg-error/10 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
