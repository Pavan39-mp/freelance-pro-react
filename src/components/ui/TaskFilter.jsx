import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

const TaskFilter = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  const options = ['All Tasks', 'Completed', 'To Do', 'In Progress', 'On Hold'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:bg-surface-variant/50 transition-colors text-body-sm text-on-surface font-medium"
      >
        <Filter className="w-4 h-4 text-primary" />
        {filter}
        <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  setFilter(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-body-sm transition-colors ${filter === opt ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-variant/50'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
