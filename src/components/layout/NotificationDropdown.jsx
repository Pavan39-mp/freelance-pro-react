import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';
import NotificationDetailsModal from '../modals/NotificationDetailsModal';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const { user } = useUser();
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-on-surface-variant hover:bg-primary-container/10 hover:text-primary rounded-full transition-all relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border border-surface"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 -right-2 sm:right-0 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-50 overflow-hidden cursor-default animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
            <h4 className="font-label-caps text-label-caps text-on-surface">Notifications</h4>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full">{unreadCount} New</span>
          </div>
          
          {unreadCount === 0 && notifications.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant font-body-sm">
              <Bell className="w-8 h-8 mb-2 opacity-50 mx-auto" />
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.slice(0, 4).map(n => (
                <div 
                  key={n.id} 
                  onClick={() => {
                    setSelectedNotification(n);
                    setIsOpen(false);
                  }}
                  className="p-4 border-b border-outline-variant/5 hover:bg-surface-variant/30 transition-colors cursor-pointer"
                >
                  <p className={`font-body-sm font-medium mb-1 ${!n.read ? 'text-primary' : 'text-on-surface'}`}>{n.title}</p>
                  <p className="text-[10px] text-on-surface-variant line-clamp-1">{n.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-outline-variant/10">
            <button 
              onClick={() => { navigate(user?.role === 'client' ? '/client/notifications' : '/freelancer/notifications'); setIsOpen(false); }}
              className="w-full p-3 text-primary text-label-caps font-bold hover:bg-surface-variant/30 transition-colors flex items-center justify-center gap-1"
            >
              See All &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Reusable Notification Modal (Dropdown Variant) */}
      <NotificationDetailsModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        variant="dropdown"
      />
    </div>
  );
};

export default NotificationDropdown;
