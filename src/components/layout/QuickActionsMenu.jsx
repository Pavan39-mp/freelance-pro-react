import React, { useState, useRef, useEffect } from 'react';
import { Plus, Folder, CheckSquare, Calendar, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ScheduleMeetingForm from '../forms/ScheduleMeetingForm';
import CreateNoteForm from '../forms/CreateNoteForm';

const QuickActionsMenu = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (path) => {
    setIsOpen(false);
    if (path) {
      navigate(path, { state: { openAddForm: true } });
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-on-surface-variant hover:bg-primary-container/10 hover:text-primary rounded-full transition-all bg-surface-container-high border border-outline-variant/20 shadow-sm"
      >
        <Plus className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full  -right-2 sm:right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {user?.role === 'client' ? (
              <button onClick={() => handleAction('/client/find-freelancers')} className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3">
                <Search className="w-4 h-4 text-secondary" />
                Find Talent
              </button>
            ) : (
              <>
                <button onClick={() => handleAction('/freelancer/projects')} className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3">
                  <Folder className="w-4 h-4 text-secondary" />
                  Add Project
                </button>
                <button onClick={() => handleAction('/freelancer/tasks')} className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Add Task
                </button>
                <div className="h-px bg-outline-variant/20 my-1"></div>
                <button onClick={() => { setIsOpen(false); setIsMeetingOpen(true); }} className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-on-surface-variant" />
                  Schedule Meeting
                </button>
                <button onClick={() => { setIsOpen(false); setIsNoteOpen(true); }} className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3">
                  <FileText className="w-4 h-4 text-on-surface-variant" />
                  Create Note
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {user?.role === 'freelancer' && isMeetingOpen && <ScheduleMeetingForm onClose={() => setIsMeetingOpen(false)} />}
      {user?.role === 'freelancer' && isNoteOpen && <CreateNoteForm onClose={() => setIsNoteOpen(false)} />}
    </div>
  );
};

export default QuickActionsMenu;
