import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Search, Filter, CheckCircle2, MessageSquare, FileText, Calendar, Trash2, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';
import { useFilterPipeline } from '../hooks/useFilterPipeline';
import Card from '../components/ui/Card';
import NotificationDetailsModal from '../components/modals/NotificationDetailsModal';
import { getIcon, getIconBg } from '../utils/notificationUtils';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  const pipelineConfig = useMemo(() => ({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    searchLogic: (n, q) => (n.title || '').toLowerCase().includes(q.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(q.toLowerCase()),
    statusLogic: (n, s) => {
      if (s === 'unread') return !n.read;
      if (s === 'read') return n.read;
      return true; // 'all'
    }
  }), []);

  const {
    search: searchQuery, setSearch: setSearchQuery,
    status: filter, setStatus: setFilter,
    page: currentPage, setPage: setCurrentPage,
    paginatedData: paginatedNotifications,
    filteredData: filteredNotifications,
    totalPages
  } = useFilterPipeline(notifications, pipelineConfig);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedNotification(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/freelancer/dashboard');
          }
        }}
        className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-label-caps text-label-caps font-bold"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-display-lg text-display-lg text-on-surface">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-caps text-label-caps">{unreadCount} New</span>
            )}
          </div>
          <p className="text-on-surface-variant font-body-lg">Stay updated with your latest alerts and messages.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-primary hover:text-primary/80 font-label-caps text-label-caps flex items-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <Card className="rounded-[1.875rem] overflow-hidden shadow-2xl flex flex-col h-[70vh] p-0">
        {/* Toolbar */}
        <div className="p-4 md:p-6 flex flex-wrap gap-4 items-center justify-between border-b border-outline-variant/10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input
                className="w-full bg-surface-container/50 border-none rounded-xl py-2 pl-10 pr-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary/50"
                placeholder="Search notifications..."
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-label-caps font-label-caps capitalize transition-all ${filter === f ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filteredNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-70">
              <Bell className="w-12 h-12 mb-4" />
              <p className="font-body-lg">No notifications found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    setSelectedNotification(notification);
                    if (!notification.read) markAsRead(notification.id);
                  }}
                  className={`group p-4 md:p-5 rounded-2xl transition-all duration-300 flex gap-4 cursor-pointer ${notification.read ? 'hover:bg-surface-variant/20' : 'bg-surface-variant/30 border border-outline-variant/10 shadow-sm'}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-body-md ${notification.read ? 'text-on-surface font-medium' : 'text-primary font-bold'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest whitespace-nowrap ml-4">
                        {format(notification.time, 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className={`text-body-sm ${notification.read ? 'text-on-surface-variant' : 'text-on-surface/90'}`}>
                      {notification.content}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {!notification.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                        className="text-[10px] text-primary hover:underline font-label-caps"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-label-caps font-bold text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-body-sm text-on-surface-variant font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-label-caps font-bold text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </Card>

      {/* Notification Modal */}
      <NotificationDetailsModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div >
  );
};

export default Notifications;
