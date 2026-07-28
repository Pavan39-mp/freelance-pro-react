import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const CalendarPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-on-surface-variant hover:bg-primary-container/10 hover:text-primary rounded-full transition-all"
      >
        <CalendarIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <h4 className="font-headline-sm text-body-lg font-bold text-on-surface flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-secondary" /> Calendar
            </h4>
            <div className="flex gap-2">
              <button className="text-on-surface-variant hover:text-primary">&lt;</button>
              <button className="text-on-surface-variant hover:text-primary">&gt;</button>
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col bg-surface-container-high">
            <span className="font-label-caps text-label-caps font-bold text-on-surface mb-3 text-center">October 2023</span>
            <div className="grid grid-cols-7 gap-1 text-center font-label-caps text-[10px] text-on-surface-variant mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-body-sm">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <button key={day} className={`p-1 rounded hover:bg-surface-variant transition-colors ${day === 24 ? 'bg-primary text-on-primary font-bold' : 'text-on-surface'}`}>
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPopover;
