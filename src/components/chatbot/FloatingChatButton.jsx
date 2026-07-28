import React from 'react';
import { Bot } from 'lucide-react';

const FloatingChatButton = () => {
  return (
    <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-tertiary text-on-primary shadow-lg flex items-center justify-center active:scale-90 transition-transform z-50 group">
      <Bot className="w-7 h-7" />
      {/* Tooltip */}
      <div className="absolute right-full mr-4 bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-body-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-outline-variant/20 shadow-2xl pointer-events-none">
        How can I help you today?
      </div>
    </button>
  );
};

export default FloatingChatButton;
