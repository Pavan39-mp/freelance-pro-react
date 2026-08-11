import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import StatCard from '../components/cards/StatCard';
import Card from '../components/ui/Card';
import ProductivityChart from '../components/charts/ProductivityChart';
import AIWidget from '../components/chatbot/AIWidget';
import { Calendar, Filter, CheckCircle2, Clock, Circle, CalendarDays, Users, Folder, Video, FileText, MessageSquare, ExternalLink } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useInvoices } from '../context/InvoiceContext';
import { useDashboard } from '../context/DashboardContext';
import TaskFilter from '../components/ui/TaskFilter';
import { useClients } from '../context/ClientContext';
import { useProjects } from '../context/ProjectContext';
import { useActivities } from '../context/ActivityContext';
import { useMeetings } from '../context/MeetingContext';
import UpcomingMeetingsWidget from '../components/dashboard/UpcomingMeetingsWidget';
import MeetingDetails from '../components/drawers/MeetingDetails';
import TaskDetailsDrawer from '../components/ui/TaskDetailsDrawer';
import ProductivityScoreCard from '../components/intelligence/ProductivityScoreCard';

const Dashboard = () => {
  const { user } = useUser();
  const dashboard = useDashboard();
  const { revenueSummary } = useInvoices() || {};
  const { clients } = useClients();
  const { projects } = useProjects();
  const { activities } = useActivities();
  const { meetings } = useMeetings();
  const [filter, setFilter] = useState('All Tasks');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarCoords, setCalendarCoords] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeView, setActiveView] = useState('Next 30 Days');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const calendarRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isTrigger = event.target.closest('.calendar-trigger');
      const isPopup = popupRef.current && popupRef.current.contains(event.target);
      if (!isTrigger && !isPopup) {
        setIsCalendarOpen(false);
        setCalendarCoords(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCalendarToggle = (e) => {
    e.stopPropagation();
    if (isCalendarOpen) {
      setIsCalendarOpen(false);
      setCalendarCoords(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const popupWidth = 360;
      const popupHeight = 350;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < popupHeight;

      setCalendarCoords({
        top: openUpward ? rect.top - popupHeight - 8 : rect.bottom + 8,
        left: Math.max(10, rect.right - popupWidth)
      });
      setIsCalendarOpen(true);
    }
  };

  // Popup Positioning Logic
  useEffect(() => {
    if (!isCalendarOpen) return;

    const positionPopup = () => {
      const activeTrigger = document.querySelector('.calendar-trigger');
      if (activeTrigger && popupRef.current) {
        const buttonRect = activeTrigger.getBoundingClientRect();
        const popupRect = popupRef.current.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        if (viewportW < 768) {
          setCalendarCoords(null);
          return;
        }

        const popupW = popupRect.width || 360;
        const popupH = popupRect.height || 350;

        let left = buttonRect.right - popupW;
        if (left < 10) left = 10;

        let top = buttonRect.bottom + 8;
        if (buttonRect.bottom + popupH + 20 > viewportH && buttonRect.top > popupH + 20) {
          top = buttonRect.top - popupH - 8;
        }

        setCalendarCoords({ top, left });
      }
    };

    positionPopup();

    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, true);

    return () => {
      window.removeEventListener('resize', positionPopup);
      window.removeEventListener('scroll', positionPopup, true);
    };
  }, [isCalendarOpen, activeView, calendarMonth]);

  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  // Use optional chaining or defaults in case context isn't fully loaded
  const {
    activeClients = 0,
    inProgressProjects = 0,
    activeTasks = 0,
    completedTasks = 0,
    totalClients = 0,
    totalProjects = 0,
    productivityScore = 0,
    productivityLevel = 'Beginner',
    dynamicUpcomingDeadlines = [],
    recentTasks = []
  } = dashboard || {};

  const getTaskIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-tertiary" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-primary" />;
      default: return <Circle className="w-5 h-5 text-outline" />;
    }
  };

  const getTaskIconBg = (status) => {
    switch (status) {
      case 'Completed': return 'bg-tertiary/10 text-tertiary';
      case 'In Progress': return 'bg-primary/10 text-primary';
      default: return 'bg-outline/10 text-outline';
    }
  };

  const getTaskBadge = (status) => {
    switch (status) {
      case 'Completed': return 'bg-surface-variant text-on-surface-variant';
      case 'In Progress': return 'bg-primary/20 text-primary';
      case 'Overdue': return 'bg-error/20 text-error';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const filteredTasks = recentTasks.filter(t => {
    let mappedStatus = t.status;
    if (['Pending', 'New', 'Not Started'].includes(t.status)) mappedStatus = 'To Do';
    if (['Paused'].includes(t.status)) mappedStatus = 'On Hold';

    if (filter === 'All Tasks') return true;
    return mappedStatus === filter;
  });

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const meetingItems = (meetings || [])
    .filter(m => m.status === 'Scheduled' || m.status === 'Ongoing')
    .map(m => {
      const proj = projects.find(p => p.id === m.project || p._id?.toString() === m.project);
      const clientName = proj?.client?.fullName || m.client || 'Internal';
      return {
        id: m._id || m.id,
        title: m.title,
        deadline: m.date,
        client: clientName,
        priority: 'Medium',
        type: 'meeting',
        meeting: m
      };
    });

  const taskItems = recentTasks
    .filter(t => t.deadline && t.status !== 'Completed')
    .map(t => {
      const clientName = t.projectId?.client?.fullName || t.clientName || 'Internal';
      return {
        id: t._id || t.id,
        title: t.title,
        deadline: t.deadline,
        client: clientName,
        priority: t.priority || 'Normal',
        type: 'task',
        task: t
      };
    });

  const allCalendarItems = [...taskItems, ...meetingItems];

  const getFilteredItems = () => {
    let filtered = [...allCalendarItems];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        try {
          const d = new Date(item.deadline);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === selected.getTime();
        } catch (e) {
          return false;
        }
      });
    } else {
      if (activeView === 'Today') {
        filtered = filtered.filter(item => {
          try {
            const d = new Date(item.deadline);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
          } catch (e) {
            return false;
          }
        });
      } else if (activeView === 'This Week') {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        filtered = filtered.filter(item => {
          try {
            const d = new Date(item.deadline);
            return d >= today && d <= endOfWeek;
          } catch (e) {
            return false;
          }
        });
      } else if (activeView === 'This Month') {
        filtered = filtered.filter(item => {
          try {
            const d = new Date(item.deadline);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          } catch (e) {
            return false;
          }
        });
      } else if (activeView === 'Next 30 Days') {
        const next30 = new Date(today);
        next30.setDate(today.getDate() + 30);
        filtered = filtered.filter(item => {
          try {
            const d = new Date(item.deadline);
            return d >= today && d <= next30;
          } catch (e) {
            return false;
          }
        });
      }
    }
    return filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  };

  const filteredUpcomingDeadlines = getFilteredItems();

  return (
    <>
      {/* Hero Greeting */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Workspace Overview</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Welcome back, {user.fullName.split(' ')[0]}. Your productivity is up 12% this week.</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Clients"
          value={`${clients.length} Total`}
          subtitle={`${activeClients} Active`}
          iconName="Users"
          change={`${activeClients} Active`}
          colorClass="text-tertiary"
          bgColorClass="bg-primary/10"
        />
        <StatCard
          title="Total Projects"
          value={`${projects.length} Total`}
          subtitle={`${inProgressProjects} In Progress`}
          iconName="Folder"
          change={`${inProgressProjects} In Progress`}
          colorClass="text-secondary"
          bgColorClass="bg-secondary-container/20"
        />
        <StatCard
          title="Active Tasks"
          value={`${activeTasks} Total`}
          subtitle="High Priority"
          iconName="AlertCircle"
          change="High Priority"
          colorClass="text-error"
          bgColorClass="bg-error-container/20"
        />
        {/* Productivity Score */}
        <Card className="flex items-center gap-6 group">
          <div className="relative w-16 h-16 rounded-full circular-progress flex items-center justify-center">
            <div className="absolute inset-[0.25rem] bg-surface-container-high rounded-full flex items-center justify-center">
              <span className="font-bold text-primary">{productivityScore}</span>
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-caps text-label-caps mb-1">Productivity</p>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">{productivityLevel}</h3>
          </div>
        </Card>
      </div>


      {/* Revenue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={revenueSummary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueSummary.totalRevenue) : '₹0'}
          subtitle="All Time (Paid)"
          iconName="TrendingUp"
          colorClass="text-tertiary"
          bgColorClass="bg-tertiary-container/20"
        />
        <StatCard
          title="Pending"
          value={revenueSummary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueSummary.pendingPayments) : '₹0'}
          subtitle="Awaiting Payment"
          iconName="Clock"
          colorClass="text-primary"
          bgColorClass="bg-primary-container/20"
        />
        <StatCard
          title="Overdue"
          value={revenueSummary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueSummary.overdueAmount) : '₹0'}
          subtitle="Action Required"
          iconName="AlertCircle"
          colorClass="text-error"
          bgColorClass="bg-error-container/20"
        />
        <StatCard
          title="Paid This Month"
          value={revenueSummary ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueSummary.paidThisMonth) : '₹0'}
          subtitle="Current Month"
          iconName="CheckCircle"
          colorClass="text-secondary"
          bgColorClass="bg-secondary-container/20"
        />
      </div>

      {/* Time Tracking Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Tracked Today"
          value={`${dashboard?.timeSummary?.hoursToday || 0}h`}
          subtitle="Hours Today"
          iconName="Clock"
          change="Hours Today"
          colorClass="text-primary"
          bgColorClass="bg-primary-container/20"
        />
        <StatCard
          title="Tracked This Week"
          value={`${dashboard?.timeSummary?.hoursThisWeek || 0}h`}
          subtitle="Hours This Week"
          iconName="Calendar"
          change="Hours This Week"
          colorClass="text-secondary"
          bgColorClass="bg-secondary-container/20"
        />
        <StatCard
          title="Most Worked Project"
          value={dashboard?.timeSummary?.mostWorkedProject?.name || 'N/A'}
          subtitle={dashboard?.timeSummary?.mostWorkedClient?.name || 'No Client'}
          iconName="Target"
          change="Client"
          colorClass="text-tertiary"
          bgColorClass="bg-tertiary-container/30"
        />
      </div>

      <ProductivityScoreCard />

      {/* Middle Section */}
      < div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6" >
        <ProductivityChart />
        <AIWidget />
      </div >

      {/* Bottom Section */}
      < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
        {/* Activity Feed */}
        < Card className="overflow-hidden flex flex-col h-[25rem] p-0" >
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Activity</h4>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {activities?.slice(0, 5).map(activity => {
              const Icon = {
                'Users': Users,
                'Folder': Folder,
                'Video': Video,
                'FileText': FileText,
                'MessageSquare': MessageSquare,
                'CheckCircle2': CheckCircle2
              }[activity.icon || 'CheckCircle2'] || CheckCircle2;

              const colorClass = activity.color ? `text-${activity.color} bg-${activity.color}/10 border-surface` : 'text-primary bg-primary/10 border-surface';

              return (
                <div key={activity.id} className="flex gap-4 relative group">
                  <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-outline-variant/20 group-last:hidden"></div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 shadow-sm ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-on-surface font-body-md">
                      <span className="font-bold">{activity.user || 'System'}</span> {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-on-surface-variant text-body-sm mt-1">{activity.description}</p>
                    )}
                    {activity.worked && (
                      <span className="inline-block mt-2 px-2 py-1 bg-tertiary/10 text-tertiary rounded text-[10px] font-bold">
                        {activity.worked}
                      </span>
                    )}
                    <p className="text-on-surface-variant/50 text-[10px] uppercase font-bold tracking-wider mt-2">
                      {new Date(activity.time || activity.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            {(!activities || activities.length === 0) && (
              <div className="text-center text-on-surface-variant py-8">
                No recent activity.
              </div>
            )}
          </div>
        </Card >

        {/* Upcoming Deadlines */}
        < Card className="flex flex-col relative z-20 p-0" >
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Upcoming Deadlines</h4>
            <div className="relative" ref={calendarRef}>
              <button
                onClick={handleCalendarToggle}
                className="calendar-trigger p-2 text-on-surface-variant hover:bg-primary-container/10 hover:text-primary rounded-full transition-all"
              >
                <CalendarDays className="w-6 h-6" />
              </button>

              {isCalendarOpen && createPortal(
                <>
                  {/* Mobile Backdrop */}
                  <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90] md:hidden"
                    onClick={() => { setIsCalendarOpen(false); setCalendarCoords(null); }}
                  ></div>

                  <div
                    ref={popupRef}
                    style={
                      calendarCoords
                        ? {
                          position: 'fixed',
                          top: `${calendarCoords.top}px`,
                          left: `${calendarCoords.left}px`,
                          width: '22.5rem',
                          transform: 'none',
                          zIndex: 9999
                        }
                        : {}
                    }
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:fixed w-[calc(100vw-2rem)] md:w-auto md:min-w-[22.5rem] max-w-[26.25rem] bg-surface-container-high border border-outline-variant/20 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="p-4 border-b border-outline-variant/10 flex flex-col gap-3 bg-surface-container-low/50">
                      <div className="flex justify-between items-center">
                        <h4 className="font-headline-sm text-body-lg font-bold text-on-surface flex items-center gap-2">
                          Calendar
                        </h4>
                        <div className="flex gap-2">
                          <button onClick={prevMonth} className="text-on-surface-variant hover:text-primary p-1">&lt;</button>
                          <span className="font-label-caps text-label-caps font-bold text-on-surface min-w-[100px] text-center">
                            {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={nextMonth} className="text-on-surface-variant hover:text-primary p-1">&gt;</button>
                        </div>
                      </div>

                      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {['Today', 'This Week', 'This Month', 'Next 30 Days'].map(view => (
                          <button
                            key={view}
                            onClick={() => { setActiveView(view); setSelectedDate(null); }}
                            className={`px-3 py-1 text-[10px] font-label-caps rounded-full whitespace-nowrap transition-colors ${!selectedDate && activeView === view ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80'}`}
                          >
                            {view}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col bg-surface-container-high">
                      <div className="grid grid-cols-7 gap-1 text-center font-label-caps text-[10px] text-on-surface-variant mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center font-body-sm relative">
                        {blanks.map(b => <div key={`blank-${b}`} className="p-1"></div>)}
                        {days.map(day => {
                          const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isSelected = selectedDate && date.toDateString() === new Date(selectedDate).toDateString();

                          const dayItems = allCalendarItems.filter(item => {
                            try {
                              return new Date(item.deadline).toDateString() === date.toDateString();
                            } catch (e) {
                              return false;
                            }
                          });

                          let highlightClass = '';
                          if (dayItems.length > 0) {
                            const hasMeeting = dayItems.some(i => i.type === 'meeting');
                            const hasHigh = dayItems.some(i => i.priority === 'High');
                            const hasMedium = dayItems.some(i => i.priority === 'Medium');
                            if (hasMeeting) highlightClass = 'bg-primary/20 text-primary font-bold';
                            else if (hasHigh) highlightClass = 'bg-error/20 text-error font-bold';
                            else if (hasMedium) highlightClass = 'bg-secondary/20 text-secondary font-bold';
                            else highlightClass = 'bg-tertiary/20 text-tertiary font-bold';
                          }

                          return (
                            <div key={day} className="relative group">
                              <button
                                onClick={() => setSelectedDate(date)}
                                className={`w-full p-1 rounded hover:bg-surface-variant transition-colors 
                                ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high' : ''} 
                                ${isToday && !isSelected && !highlightClass ? 'bg-primary text-on-primary font-bold' : highlightClass ? highlightClass : 'text-on-surface'}
                              `}
                              >
                                {day}
                              </button>

                              {dayItems.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface border border-outline-variant/20 rounded-lg shadow-xl p-2 z-[60] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                  {dayItems.map(item => (
                                    <div key={item.id} className="text-left mb-1 last:mb-0 border-b border-outline-variant/10 last:border-0 pb-1 last:pb-0">
                                      <p className="text-[10px] font-bold text-on-surface truncate flex items-center gap-1">
                                        {item.type === 'meeting' ? <Video className="w-2.5 h-2.5 text-primary" /> : <FileText className="w-2.5 h-2.5 text-secondary" />}
                                        {item.title}
                                      </p>
                                      <p className="text-[9px] text-on-surface-variant truncate">{item.client}</p>
                                      <span className={`text-[8px] px-1 rounded-sm ${item.type === 'meeting' ? 'bg-primary/10 text-primary' : item.priority === 'High' ? 'bg-error/10 text-error' : item.priority === 'Medium' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}`}>
                                        {item.type === 'meeting' ? 'Meeting' : item.priority}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => { setCalendarMonth(new Date()); setSelectedDate(new Date()); setActiveView('Today'); }}
                        className="mt-4 w-full py-2 bg-primary/10 text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {filteredUpcomingDeadlines.slice(0, 5).map(deadline => (
              <div
                key={deadline.id}
                className="flex items-center gap-4 cursor-pointer hover:bg-surface-container-high/30 p-2 rounded-xl transition-all"
                onClick={() => {
                  if (deadline.type === 'meeting') {
                    setSelectedMeeting(deadline.meeting);
                  } else {
                    setActiveTask(deadline.task);
                  }
                }}
              >
                {(() => {
                  const d = new Date(deadline.deadline);
                  const dateStr = d.getDate();
                  const monthStr = d.toLocaleString('default', { month: 'short' });
                  const isMeeting = deadline.type === 'meeting';
                  const isHigh = deadline.priority === 'High';
                  const isMedium = deadline.priority === 'Medium';

                  let badgeColors = 'bg-surface-container-high border-outline-variant/30';
                  let textColors = 'text-on-surface';
                  let subColors = 'text-on-surface-variant';

                  if (isMeeting) {
                    badgeColors = 'bg-primary/10 border-primary/20';
                    textColors = 'text-primary';
                    subColors = 'text-primary/70';
                  } else if (isHigh) {
                    badgeColors = 'bg-error-container/20 border-error/20';
                    textColors = 'text-error';
                    subColors = 'text-error/70';
                  } else if (isMedium) {
                    badgeColors = 'bg-secondary-container/20 border-secondary/20';
                    textColors = 'text-secondary';
                    subColors = 'text-secondary/70';
                  }

                  return (
                    <div className={`text-center p-2 rounded-lg min-w-[50px] border ${badgeColors}`}>
                      <p className={`${textColors} font-black text-headline-sm leading-none`}>{dateStr}</p>
                      <p className={`${subColors} font-label-caps text-[10px]`}>{monthStr}</p>
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <h5 className="text-on-surface font-bold truncate flex items-center gap-1.5">
                    {deadline.type === 'meeting' ? <Video className="w-3.5 h-3.5 text-primary shrink-0" /> : <FileText className="w-3.5 h-3.5 text-secondary shrink-0" />}
                    {deadline.title}
                  </h5>
                  <p className="text-on-surface-variant text-body-sm truncate">Client: {deadline.client}</p>
                  {deadline.type === 'meeting' && deadline.meeting?.joinUrl && (
                    <a
                      href={deadline.meeting.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      Join Meeting <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {filteredUpcomingDeadlines.length === 0 && (
              <div className="text-center text-on-surface-variant py-4">
                {selectedDate ? "No events scheduled for this date." : "No upcoming deadlines or meetings."}
              </div>
            )}
          </div>
        </Card >

        {/* Upcoming Meetings */}
        < div className="relative z-10" >
          <UpcomingMeetingsWidget onViewMeeting={(m) => setSelectedMeeting(m)} />
        </div >
      </div >

      {/* Meeting Details Drawer */}
      < MeetingDetails
        meeting={selectedMeeting}
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={activeTask}
        onClose={() => setActiveTask(null)}
      />
    </>
  );
};

export default Dashboard;
