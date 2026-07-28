import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { getIcon, getIconBg } from '../../utils/notificationUtils';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDetailsModal = ({ notification, isOpen, onClose, variant = 'modal' }) => {
  const { markAsRead } = useNotifications();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent background scrolling and auto-mark as read (only for modal variant)
  useEffect(() => {
    if (isOpen) {
      if (variant !== 'dropdown') {
        document.body.style.overflow = 'hidden';
      }
      if (notification && !notification.read) {
        markAsRead(notification.id);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, notification, markAsRead]);

  if (!isOpen || !notification) return null;

  if (variant === 'dropdown') {
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose}></div>
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-outline-variant/20 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 p-5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-on-surface-variant font-label-caps text-[10px] tracking-widest font-bold flex items-center gap-2">
              <Bell className="w-3 h-3" /> Details
            </h2>
            <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors -mr-1.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5 shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}>
              {React.cloneElement(getIcon(notification.type), { className: 'w-5 h-5' })}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-body-md font-bold text-on-surface leading-tight mb-1 truncate">{notification.title}</h3>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest ${notification.read ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary/20 text-primary'}`}>
                {notification.read ? 'Read' : 'New'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-5 overflow-y-auto max-h-[300px] custom-scrollbar">
            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/10">
              <h4 className="text-[9px] text-on-surface-variant tracking-widest font-bold mb-2 border-b border-outline-variant/10 pb-1.5">Description</h4>
              <p className="font-body-sm text-on-surface/90 leading-relaxed whitespace-pre-wrap">
                {notification.content}
              </p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/10">
              <h4 className="text-[9px] text-on-surface-variant tracking-widest font-bold mb-3 border-b border-outline-variant/10 pb-1.5">Information</h4>
              <div className="grid grid-cols-1 gap-y-3">
                {notification.clientName && (
                  <div>
                    <p className="text-[9px] text-on-surface-variant font-bold mb-0.5">Client</p>
                    <p className="font-body-sm text-on-surface truncate">{notification.clientName}</p>
                  </div>
                )}
                {notification.projectName && (
                  <div>
                    <p className="text-[9px] text-on-surface-variant font-bold mb-0.5">Project</p>
                    <p className="font-body-sm text-on-surface truncate">{notification.projectName}</p>
                  </div>
                )}
                {notification.taskName && (
                  <div>
                    <p className="text-[9px] text-on-surface-variant font-bold mb-0.5">Task</p>
                    <p className="font-body-sm text-on-surface truncate">{notification.taskName}</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
                  <div>
                    <p className="text-[9px] text-on-surface-variant font-bold mb-0.5">Date</p>
                    <p className="text-[11px] text-on-surface">{format(notification.time, 'dd MMM yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-on-surface-variant font-bold mb-0.5">Time</p>
                    <p className="text-[11px] text-on-surface">{format(notification.time, 'hh:mm a')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface border border-outline-variant/20 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-[600px] z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-on-surface-variant font-label-caps text-[10px] tracking-widest font-bold flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notification Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-5 mb-8 shrink-0">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notification.type)}`}>
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight mb-2">{notification.title}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${notification.read ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary/20 text-primary'}`}>
              {notification.read ? 'Read' : 'New'}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4 mb-8">
          {/* Main Description */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
            <h4 className="text-[10px] text-on-surface-variant tracking-widest font-bold mb-3 border-b border-outline-variant/10 pb-2">Description</h4>
            <p className="font-body-md text-on-surface/90 leading-relaxed whitespace-pre-wrap">
              {notification.content}
            </p>
          </div>

          {/* Information Grid */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
            <h4 className="text-[10px] text-on-surface-variant tracking-widest font-bold mb-4 border-b border-outline-variant/10 pb-2">Information</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {notification.clientName ? (
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold mb-1">Client</p>
                  <p className="font-body-sm text-on-surface truncate" title={notification.clientName}>{notification.clientName}</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold mb-1">Client</p>
                  <p className="font-body-sm text-on-surface-variant truncate">—</p>
                </div>
              )}
              {notification.projectName ? (
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold mb-1">Project</p>
                  <p className="font-body-sm text-on-surface truncate" title={notification.projectName}>{notification.projectName}</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold mb-1">Project</p>
                  <p className="font-body-sm text-on-surface-variant truncate">—</p>
                </div>
              )}
              {notification.taskName ? (
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold mb-1">Task</p>
                  <p className="font-body-sm text-on-surface truncate" title={notification.taskName}>{notification.taskName}</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold mb-1">Task</p>
                  <p className="font-body-sm text-on-surface-variant truncate">—</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold mb-1">Activity Type</p>
                <p className="font-body-sm text-on-surface capitalize">{notification.type}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold mb-1">Date</p>
                <p className="font-body-sm text-on-surface">{format(notification.time, 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-bold mb-1">Time</p>
                <p className="font-body-sm text-on-surface">{format(notification.time, 'hh:mm a')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-surface-variant text-on-surface rounded-xl font-label-caps text-label-caps font-bold hover:bg-surface-variant/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
