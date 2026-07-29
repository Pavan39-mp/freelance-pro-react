import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Clock, Save, X, Activity } from 'lucide-react';
import { useTimeTracking } from '../../context/TimeTrackingContext';

const TaskTimeTrackingTab = ({ task }) => {
  const { activeSession, startTimer, stopTimer, addManualEntry, getTaskSessions, deleteEntry } = useTimeTracking();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualData, setManualData] = useState({ date: new Date().toISOString().split('T')[0], hours: '', minutes: '', note: '' });
  const [elapsed, setElapsed] = useState(0);

  const isActiveForThisTask = activeSession && activeSession.taskId === task.id;

  const loadSessions = async () => {
    try {
      const data = await getTaskSessions(task.id);
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [task.id, activeSession]); // reload when active session changes (like stopped)

  useEffect(() => {
    let interval;
    if (isActiveForThisTask) {
      const start = new Date(activeSession.startTime).getTime();
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isActiveForThisTask, activeSession]);

  const handleStart = async () => {
    await startTimer(task.id, task.projectId || (task.project && task.project._id) || task.project);
  };

  const handleStop = async () => {
    await stopTimer();
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const h = parseInt(manualData.hours || 0) * 3600;
    const m = parseInt(manualData.minutes || 0) * 60;
    const dur = h + m;
    if (dur <= 0) return;

    await addManualEntry({
      taskId: task.id,
      projectId: task.projectId || (task.project && task.project._id) || task.project,
      date: new Date(manualData.date).toISOString(),
      durationSeconds: dur,
      note: manualData.note
    });

    setShowManual(false);
    setManualData({ date: new Date().toISOString().split('T')[0], hours: '', minutes: '', note: '' });
    loadSessions();
  };

  const formatElapsed = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatSessionTime = (dur) => {
    const h = Math.floor(dur / 3600);
    const m = Math.floor((dur % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${dur % 60}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Live Timer Card */}
      <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/20 flex flex-col items-center justify-center relative overflow-hidden">
        {isActiveForThisTask && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-xl"></div>
        )}
        <h3 className="text-on-surface-variant font-label-caps text-[10px] tracking-widest uppercase font-bold mb-2 z-10">
          {isActiveForThisTask ? 'Active Timer' : 'Ready to Track'}
        </h3>
        <div className={`font-mono text-5xl font-bold tracking-wider mb-6 z-10 ${isActiveForThisTask ? 'text-primary' : 'text-on-surface'}`}>
          {formatElapsed(elapsed)}
        </div>
        
        <div className="flex gap-4 z-10">
          {!isActiveForThisTask ? (
            <button onClick={handleStart} className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <Play className="w-6 h-6 ml-1" />
            </button>
          ) : (
            <button onClick={handleStop} className="w-14 h-14 rounded-full bg-error flex items-center justify-center text-on-error hover:scale-105 transition-transform shadow-lg shadow-error/20">
              <Square className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Manual Entry Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="font-display-sm text-on-surface">Time History</h3>
        <button 
          onClick={() => setShowManual(!showManual)}
          className="text-primary hover:text-primary/80 font-bold text-body-sm flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          {showManual ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showManual ? 'Cancel' : 'Add Time'}
        </button>
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <form onSubmit={handleManualSubmit} className="bg-surface-container-low p-4 rounded-xl border border-primary/20 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">Date</label>
              <input type="date" required value={manualData.date} onChange={e => setManualData({...manualData, date: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">Hours</label>
                <input type="number" min="0" placeholder="0" value={manualData.hours} onChange={e => setManualData({...manualData, hours: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">Mins</label>
                <input type="number" min="0" max="59" placeholder="0" value={manualData.minutes} onChange={e => setManualData({...manualData, minutes: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">Note (Optional)</label>
            <input type="text" placeholder="What did you work on?" value={manualData.note} onChange={e => setManualData({...manualData, note: e.target.value})} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold text-body-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" /> Save Entry
          </button>
        </form>
      )}

      {/* History List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-on-surface-variant">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant/20">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>No time tracked yet.</p>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s._id} className="flex items-center justify-between p-3 bg-surface-container-high border border-outline-variant/10 rounded-xl group hover:border-outline-variant/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.isManual ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'}`}>
                  {s.isManual ? <Save className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-on-surface font-bold text-body-sm">{formatSessionTime(s.duration)}</p>
                  <p className="text-on-surface-variant text-[11px] flex gap-2">
                    <span>{new Date(s.startTime).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    {s.note && <span>• {s.note}</span>}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => deleteEntry(s._id)}
                className="p-2 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskTimeTrackingTab;
