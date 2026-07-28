import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const DetailsDrawer = ({ isOpen, onClose, children }) => {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      {/* Drawer Panel */}
      <div className="relative w-full md:w-[460px] lg:w-[520px] h-full bg-surface-container border-l border-outline-variant/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-10">
        {children}
      </div>
    </div>,
    document.body
  );
};

export default DetailsDrawer;
