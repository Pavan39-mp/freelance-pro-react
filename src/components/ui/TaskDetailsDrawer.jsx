import React, { useState, useRef } from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  X, Calendar, Clock, Target, CheckCircle2, Circle, AlertCircle,
  MessageSquare, Paperclip, Activity, FileText, ChevronDown,
  Upload, Trash2, Edit2, AlertTriangle, TrendingUp
} from 'lucide-react';
import FileCard from './FileCard';
import UpdateProgressModal from '../forms/UpdateProgressModal';
import TaskTimeTrackingTab from './TaskTimeTrackingTab';
import AutoResizeTextarea from './AutoResizeTextarea';

const TaskDetailsDrawer = ({ task, onClose }) => {
  const { updateTask, addComment, editComment, deleteComment, addAttachment, deleteAttachment } = useTasks();
  const [activeTab, setActiveTab] = useState('details');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const fileInputRef = useRef(null);

  const handleDeleteAttachment = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    try {
      await deleteAttachment(task.id || task._id, fileId);
    } catch (error) {
      console.error("Failed to delete attachment", error);
      alert("Failed to delete attachment. Please try again.");
    }
  };

  if (!task) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-error/20 text-error';
      case 'Medium': return 'bg-tertiary/20 text-tertiary';
      case 'Low': return 'bg-primary/20 text-primary';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const getStatusIcon = (status, isBlocked) => {
    if (isBlocked) return <AlertTriangle className="w-5 h-5 text-error" />;
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-tertiary" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-primary" />;
      case 'Overdue': return <AlertCircle className="w-5 h-5 text-error" />;
      case 'On Hold': return <AlertCircle className="w-5 h-5 text-error" />;
      default: return <Circle className="w-5 h-5 text-outline" />;
    }
  };

  const handleStatusChange = (e) => {
    updateTask(task.id, { status: e.target.value });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(task.id, newComment);
    setNewComment('');
  };

  const handleSaveEditComment = () => {
    if (!editCommentText.trim()) return;
    editComment(task.id, editingCommentId, editCommentText);
    setEditingCommentId(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addAttachment(task.id, file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[80] transition-opacity animate-in fade-in"
        onClick={onClose}
      ></div>

      <div className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-surface-container border-l border-outline-variant/20 shadow-2xl z-[90] flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start bg-surface-container-low/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className="text-on-surface-variant text-[10px] font-bold tracking-wider">
                {task.project} • {task.client}
              </span>
            </div>
            <h2 className="font-headline-md text-headline-sm text-on-surface leading-tight">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-surface-variant/50 hover:bg-surface-variant text-on-surface-variant rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Bar */}
        <div className="px-6 py-4 border-b border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-container">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant">Status</label>
            <div className="relative">
              <select
                value={task.status}
                onChange={handleStatusChange}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-1.5 px-3 pr-8 focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant">Due Date</label>
            <div className="flex items-center gap-1.5 text-body-sm text-on-surface">
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              {task.deadline || 'No deadline'}
            </div>
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant flex justify-between">
              <span>Time Tracked</span>
              <span className="text-primary">{task.workedHours || 0} / {task.estimatedHours}h</span>
            </label>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, ((task.workedHours || 0) / (task.estimatedHours || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
                <span className="text-on-surface-variant flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Progress</span>
                <span className="text-primary">{task.progress || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${task.isBlocked ? 'bg-error' : task.progress === 100 ? 'bg-tertiary' : 'bg-primary'}`} style={{ width: `${task.progress || 0}%` }}></div>
              </div>
            </div>
            <button
              onClick={() => setShowProgressModal(true)}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps font-bold active:scale-95 duration-200 flex items-center gap-2 flex-shrink-0 hover:shadow-[0_0_15px_rgba(var(--color-primary),0.3)] transition-all"
            >
              <TrendingUp className="w-4 h-4" /> Update
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-outline-variant/10 gap-6">
          {[
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'time', label: 'Time Tracking', icon: Clock },
            { id: 'history', label: 'History', icon: Activity },
            { id: 'comments', label: `Comments (${(task.comments || []).length})`, icon: MessageSquare },
            { id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-body-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface-container-low/30">

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h4 className="text-label-caps font-bold tracking-wider text-on-surface-variant mb-2">Description</h4>
                <p className="text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">
                  {task.description || "No description provided."}
                </p>
              </div>
              {task.isBlocked && (
                <div className="p-4 bg-error-container/20 border border-error/20 rounded-xl">
                  <h4 className="text-error font-bold flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4" /> Blocked
                  </h4>
                  <p className="text-error/80 text-body-sm">{task.blockReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Time Tracking Tab */}
          {activeTab === 'time' && (
            <TaskTimeTrackingTab task={task} />
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in">
              {task.progressHistory && task.progressHistory.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-outline-variant/20"></div>
                  {task.progressHistory.map((entry, index) => (
                    <div key={index} className="flex gap-4 relative mb-6 last:mb-0 group">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-primary z-10 shrink-0">
                        {entry.isBlocked ? <AlertTriangle className="w-4 h-4 text-error" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 bg-surface-container-high p-4 rounded-xl border border-outline-variant/10 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-on-surface font-body-sm font-bold">{entry.user}</p>
                          <span className="text-[10px] text-on-surface-variant tracking-wider font-bold">
                            {formatTime(entry.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-surface-variant rounded text-[10px] font-bold text-on-surface">
                            {entry.prevProgress}% → {entry.newProgress}%
                          </span>
                          {entry.hoursWorked > 0 && (
                            <span className="px-2 py-1 bg-primary/10 rounded text-[10px] font-bold text-primary flex items-center gap-1">
                              <Clock className="w-3 h-3" /> +{entry.hoursWorked}h
                            </span>
                          )}
                        </div>
                        {entry.summary && (
                          <p className="text-body-sm text-on-surface-variant mt-2">{entry.summary}</p>
                        )}
                        {entry.isBlocked && (
                          <p className="text-body-sm text-error mt-2 font-bold">Blocked: {entry.blockReason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No progress history yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="flex-1 space-y-4 mb-6">
                {(task.comments || []).map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-body-sm shrink-0">
                      {comment.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-surface-container-high p-3 rounded-2xl rounded-tl-sm border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-body-sm text-on-surface">{comment.user}</span>
                          <span className="text-[10px] text-on-surface-variant">{formatTime(comment.date)}</span>
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="mt-2">
                            <AutoResizeTextarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                              maxHeight={160}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                              <button onClick={handleSaveEditComment} className="text-[10px] font-bold text-primary hover:text-primary/80">Save</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-body-sm text-on-surface whitespace-pre-wrap">{comment.text}</p>
                        )}
                      </div>

                      {!editingCommentId && comment.user === 'Alex Rivera' && (
                        <div className="flex gap-3 mt-1 ml-2">
                          <button
                            onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.text); }}
                            className="text-[10px] font-bold tracking-wider text-on-surface-variant hover:text-primary flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Delete comment?')) deleteComment(task.id, comment.id); }}
                            className="text-[10px] font-bold tracking-wider text-on-surface-variant hover:text-error flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!task.comments || task.comments.length === 0) && (
                  <div className="text-center py-8 text-on-surface-variant">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No comments yet.</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="mt-auto relative">
                <AutoResizeTextarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 pr-12 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none min-h-[80px] resize-none"
                  maxHeight={192}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-primary text-on-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-6 animate-in fade-in">
              <div
                className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 text-center hover:bg-surface-variant/20 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-8 h-8 mx-auto mb-3 text-on-surface-variant group-hover:text-primary transition-colors" />
                <p className="text-body-md font-bold text-on-surface mb-1">Click to upload files</p>
                <p className="text-body-sm text-on-surface-variant">PNG, JPG, PDF up to 10MB</p>
              </div>

              <div className="space-y-3">
                {(task.attachments || []).map(file => (
                  <FileCard
                    key={file.id || file._id}
                    file={file}
                    onDelete={handleDeleteAttachment}
                    showDelete={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showProgressModal && (
        <UpdateProgressModal
          task={task}
          onClose={() => setShowProgressModal(false)}
        />
      )}
    </>
  );
};

export default TaskDetailsDrawer;
