import React, { useMemo } from 'react';
import { Calendar, Clock, ExternalLink, Video } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMeetings } from '../../context/MeetingContext';
import Card from '../../components/ui/Card';
import MeetingStatusBadge from '../../components/meetings/MeetingStatusBadge';

const validMeetingUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const ClientMeetings = () => {
  const { meetings } = useMeetings();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('meetingId');
  const orderedMeetings = useMemo(() => [...meetings].sort((a, b) => {
    const aTime = new Date(`${a.date}T${a.time}`).getTime();
    const bTime = new Date(`${b.date}T${b.time}`).getTime();
    return aTime - bTime;
  }), [meetings]);

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-6">
      <div>
        <h1 className="font-headline-md text-3xl font-bold text-on-surface">Meetings</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">View meeting details and join your scheduled calls.</p>
      </div>

      {orderedMeetings.length === 0 ? (
        <Card className="p-10 text-center">
          <Video className="mx-auto mb-3 h-9 w-9 text-on-surface-variant" />
          <p className="text-on-surface-variant">No meetings are scheduled.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderedMeetings.map((meeting) => {
            const id = String(meeting._id || meeting.id);
            const canJoin = validMeetingUrl(meeting.joinUrl) && meeting.status !== 'Cancelled';
            return (
              <Card key={id} className={`p-5 md:p-6 ${selectedId === id ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-headline-sm text-xl font-bold text-on-surface break-words">{meeting.title}</h2>
                      <MeetingStatusBadge status={meeting.status} />
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      With {meeting.freelancer?.fullName || meeting.user?.fullName || 'Freelancer'}
                      {meeting.project ? ` · ${meeting.project}` : ''}
                    </p>
                    <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant sm:flex-row sm:flex-wrap sm:gap-4">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(`${meeting.date}T${meeting.time}`).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{meeting.time} · {meeting.duration || 30} minutes</span>
                      <span>{meeting.provider}</span>
                    </div>
                    {(meeting.agenda || meeting.notes) && <p className="whitespace-pre-wrap break-words text-body-sm text-on-surface">{meeting.agenda || meeting.notes}</p>}
                  </div>
                  {canJoin ? (
                    <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary">
                      Join Meeting <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <button type="button" disabled className="shrink-0 rounded-xl bg-surface-variant px-5 py-3 font-bold text-on-surface-variant opacity-60">Invalid meeting link</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientMeetings;
