import React, { useState } from 'react';
import { X, Target, Clock, FileText, AlertTriangle, Undo2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

const UpdateProgressModal = ({ task, onClose }) => {
  const { updateTaskProgress, undoLastProgress } = useTasks();

  const [progress, setProgress] = useState(task.progress || 0);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [summary, setSummary] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    if (progress < task.progress) {
      setError(`Progress cannot be decreased manually. Please use the Undo button to revert.`);
      return;
    }
    if (progress > 100) {
      setError('Progress cannot exceed 100%.');
      return;
    }
    if (hoursWorked < 0) {
      setError('Hours worked cannot be negative.');
      return;
    }
    if (isBlocked && !blockReason.trim()) {
      setError('Please provide a reason for blocking the task.');
      return;
    }

    updateTaskProgress(task.id, Number(progress), Number(hoursWorked), summary, isBlocked, blockReason);
    onClose();
  };

  const handleUndo = () => {
    if (window.confirm('Are you sure you want to undo the last progress update? This will revert the progress and hours worked.')) {
      undoLastProgress(task.id);
      onClose();
    }
  };

  const hasHistory = task.progressHistory && task.progressHistory.length > 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-surface-container-high border border-outline-variant/20 rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div>
            <h3 className="font-headline-md text-headline-sm text-on-surface">Update Progress</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-body-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Progress Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                <Target className="w-4 h-4" /> Progress Percentage
              </label>
              <span className="font-display-sm text-display-sm text-primary">{progress}%</span>
            </div>
            <Input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={e => setProgress(e.target.value)}
              className="progress-range cursor-pointer py-0 px-0 border-none"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant font-bold">
              <span>0% (To Do)</span>
              <span>Previous: {task.progress}%</span>
              <span>100% (Done)</span>
            </div>
          </div>

          {/* Hours Worked */}
          <div className="space-y-1">
            <Input
              type="number"
              step="0.5"
              min="0"
              label="Hours Worked Today"
              value={hoursWorked}
              onChange={e => setHoursWorked(e.target.value)}
              placeholder="e.g. 2.5"
            />
            <p className="text-[10px] text-on-surface-variant mt-1">Estimated: {task.estimatedHours}h • Total Worked So Far: {task.workedHours || 0}h</p>
          </div>

          {/* Work Summary */}
          <Input
            type="textarea"
            label="Work Summary (Optional)"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="What did you accomplish today?"
            rows={3}
          />

          {/* Blockers */}
          <div className="space-y-3 p-4 bg-surface-container/50 border border-outline-variant/30 rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={e => setIsBlocked(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant/30 text-error focus:ring-error/50 bg-surface-container"
              />
              <span className="font-body-md text-on-surface">Mark task as blocked</span>
            </label>
            {isBlocked && (
              <Input
                type="text"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="Why is this task blocked?"
                className="mt-2"
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
            {hasHistory ? (
              <Button
                variant="outline"
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors font-bold text-body-sm py-2"
              >
                <Undo2 className="w-4 h-4" /> Undo Last Update
              </Button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
                Save Progress
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgressModal;
