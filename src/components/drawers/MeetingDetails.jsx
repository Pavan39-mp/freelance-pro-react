import React, { useState } from 'react';
import DetailsDrawer from '../ui/DetailsDrawer';
import MeetingStatusBadge from '../meetings/MeetingStatusBadge';
import { useMeetings } from '../../context/MeetingContext';
import { useTasks } from '../../context/TaskContext';
import { X, Calendar, Clock, Video, Users, ExternalLink, FileText, CheckCircle2, ListTodo } from 'lucide-react';
import toast from 'react-hot-toast';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';

const MeetingDetails = ({ meeting, isOpen, onClose }) => {
  const { updateMeeting } = useMeetings();
  const { addTask } = useTasks();

  const [summaryData, setSummaryData] = useState({
    summary: meeting?.summary || '',
    decisions: meeting?.decisions || '',
    actionItems: meeting?.actionItems || '',
    followUpDate: meeting?.followUpDate || ''
  });

  const [isEditingSummary, setIsEditingSummary] = useState(false);

  if (!meeting) return null;

  const handleJoin = () => {
    if (meeting.joinUrl) {
      window.open(meeting.joinUrl, '_blank');
    }
  };

  const handleSaveSummary = () => {
    updateMeeting(meeting.id, {
      ...summaryData
    });
    setIsEditingSummary(false);
    toast.success('Meeting summary saved');
  };

  const handleCreateTask = () => {
    addTask({
      title: `Follow up: ${meeting.title}`,
      client: meeting.client || '',
      project: meeting.project || '',
      priority: 'Medium',
      deadline: summaryData.followUpDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'Pending',
      progress: 0
    });
    toast.success('Follow-up task created');
  };

  return (
    <DetailsDrawer isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-outline-variant/10 bg-surface-container-low shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 text-primary shadow-sm">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-display-sm text-on-surface leading-tight mb-1 pr-4">{meeting.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-on-surface-variant font-medium">{meeting.client || 'Internal'}</span>
              <MeetingStatusBadge status={meeting.status} />
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-error rounded-full transition-colors -mr-2 -mt-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-surface animate-in fade-in slide-in-from-left-4 duration-300">

        {/* Join Button Section */}
        <div className="flex flex-col gap-3">
          {meeting.joinUrl ? (
            <button onClick={handleJoin} className="w-full py-4 bg-primary text-on-primary rounded-2xl font-headline-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
              <Video className="w-5 h-5" /> Join Meeting
              <ExternalLink className="w-4 h-4 opacity-70" />
            </button>
          ) : (
            <div className="w-full py-4 bg-surface-variant/30 text-on-surface-variant rounded-2xl font-body-sm flex items-center justify-center border border-outline-variant/20 border-dashed">
              No meeting link generated.
            </div>
          )}

          {meeting.providerData?.passcode && (
            <p className="text-center text-body-sm text-on-surface-variant">Passcode: <span className="font-mono text-on-surface font-bold">{meeting.providerData.passcode}</span></p>
          )}
        </div>

        {/* Info Grid */}
        <section>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4">Meeting Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3 items-center">
              <Calendar className="w-4 h-4 text-primary opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Date</p>
                <p className="font-body-sm text-on-surface">{meeting.date}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Clock className="w-4 h-4 text-secondary opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Time & Duration</p>
                <p className="font-body-sm text-on-surface">{meeting.time} ({meeting.duration}m)</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Users className="w-4 h-4 text-tertiary opacity-70 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Provider</p>
                <p className="font-body-sm text-on-surface">{meeting.provider || 'Google Meet'}</p>
              </div>
            </div>
            {meeting.project && (
              <div className="flex gap-3 items-center">
                <FileText className="w-4 h-4 text-primary opacity-70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Project</p>
                  <p className="font-body-sm text-on-surface truncate">{meeting.project}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Agenda */}
        {meeting.agenda && (
          <section>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4">Agenda</h3>
            <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl whitespace-pre-wrap text-body-sm text-on-surface">
              {meeting.agenda}
            </div>
          </section>
        )}

        {/* Post-Meeting Summary (Only fully editable after meeting, but viewable always) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">Post-Meeting Summary</h3>
            {(meeting.status === 'Completed' || meeting.status === 'Ongoing') && !isEditingSummary && (
              <button onClick={() => setIsEditingSummary(true)} className="text-[10px] text-primary font-bold hover:underline">Edit</button>
            )}
          </div>

          {isEditingSummary ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-on-surface-variant font-bold tracking-widest">Key Decisions</label>
                <AutoResizeTextarea
                  value={summaryData.decisions}
                  onChange={(e) => setSummaryData({ ...summaryData, decisions: e.target.value })}
                  className="w-full mt-1 bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-body-sm text-on-surface focus:ring-1 focus:ring-primary"
                  rows="2"
                  maxHeight={160}
                />
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant font-bold tracking-widest">Action Items</label>
                <AutoResizeTextarea
                  value={summaryData.actionItems}
                  onChange={(e) => setSummaryData({ ...summaryData, actionItems: e.target.value })}
                  className="w-full mt-1 bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-body-sm text-on-surface focus:ring-1 focus:ring-primary"
                  rows="2"
                  maxHeight={160}
                />
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant font-bold tracking-widest">Follow-up Date</label>
                <input
                  type="date"
                  value={summaryData.followUpDate}
                  onChange={(e) => setSummaryData({ ...summaryData, followUpDate: e.target.value })}
                  className="w-full mt-1 bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 text-body-sm text-on-surface focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsEditingSummary(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-variant">Cancel</button>
                <button onClick={handleSaveSummary} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:brightness-110">Save Summary</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {meeting.decisions ? (
                <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl space-y-3">
                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Key Decisions</h4>
                    <p className="text-body-sm text-on-surface whitespace-pre-wrap">{meeting.decisions}</p>
                  </div>
                  {meeting.actionItems && (
                    <div className="pt-3 border-t border-outline-variant/10">
                      <h4 className="text-[10px] font-bold text-on-surface-variant tracking-wider mb-1 flex items-center gap-1.5"><ListTodo className="w-3.5 h-3.5 text-secondary" /> Action Items</h4>
                      <p className="text-body-sm text-on-surface whitespace-pre-wrap">{meeting.actionItems}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl border-dashed text-center">
                  <p className="text-body-sm text-on-surface-variant mb-2">No summary recorded yet.</p>
                  {meeting.status === 'Completed' && (
                    <button onClick={() => setIsEditingSummary(true)} className="text-xs font-bold text-primary">Log Summary</button>
                  )}
                </div>
              )}

              {meeting.actionItems && (
                <button onClick={handleCreateTask} className="w-full py-3 bg-surface-variant/30 hover:bg-surface-variant text-on-surface rounded-xl text-xs font-bold tracking-wider transition-colors border border-outline-variant/10 flex items-center justify-center gap-2">
                  <ListTodo className="w-4 h-4" /> Create Follow-Up Task
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </DetailsDrawer>
  );
};

export default MeetingDetails;
