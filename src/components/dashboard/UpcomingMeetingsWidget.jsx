import React, { useEffect, useState } from 'react';
import { useMeetings } from '../../context/MeetingContext';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';
import MeetingStatusBadge from '../meetings/MeetingStatusBadge';
import Card from '../ui/Card';

const UpcomingMeetingsWidget = ({ onViewMeeting }) => {
  const { meetings } = useMeetings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getUpcomingMeetings = () => {
    return meetings
      .filter(m => m.status === 'Scheduled' || m.status === 'Ongoing')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      })
      .slice(0, 5);
  };

  const getCountdown = (date, time) => {
    const meetingTime = new Date(`${date}T${time}`);
    const diffMs = meetingTime - now;
    if (diffMs <= 0) return { text: 'Started', mins: 0 };

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const totalMins = Math.floor(diffMs / 60000);

    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24);
      return { text: `In ${days} day${days > 1 ? 's' : ''}`, mins: totalMins };
    }
    if (diffHrs > 0) return { text: `In ${diffHrs}h ${diffMins}m`, mins: totalMins };
    return { text: `In ${diffMins}m`, mins: totalMins };
  };

  const upcomingMeetings = getUpcomingMeetings();

  return (
    <Card className="flex flex-col h-[25rem] p-0 rounded-[1.25rem]">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
        <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <Video className="w-5 h-5 text-secondary" />
          Upcoming Meetings
        </h4>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {upcomingMeetings.map(meeting => {
          const countdown = getCountdown(meeting.date, meeting.time);
          const showJoin = countdown.mins <= 15 || meeting.status === 'Ongoing';

          return (
            <div key={meeting.id} className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-body-md font-bold text-on-surface truncate pr-4">{meeting.title}</h5>
                {showJoin && countdown.mins > 0 ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap bg-secondary/10 text-secondary animate-pulse">
                    {countdown.text}
                  </span>
                ) : (
                  <MeetingStatusBadge status={meeting.status} />
                )}
              </div>

              <p className="text-on-surface-variant text-body-sm truncate mb-3">{meeting.client} • {meeting.provider || meeting.type || 'Google Meet'}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(meeting.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.time}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  {showJoin && meeting.joinUrl ? (
                    <a
                      href={meeting.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[10px] font-bold hover:brightness-110 transition-colors flex items-center gap-1.5"
                    >
                      Join <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onViewMeeting && onViewMeeting(meeting)}
                      className="px-3 py-1.5 border border-outline-variant/20 text-on-surface rounded-lg text-[10px] font-bold hover:bg-surface-variant transition-colors"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {upcomingMeetings.length === 0 && (
          <div className="text-center text-on-surface-variant py-8 font-body-sm">
            <Video className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>No upcoming meetings.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingMeetingsWidget;
