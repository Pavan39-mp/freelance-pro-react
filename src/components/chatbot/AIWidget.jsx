import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';

const AIWidget = () => {
  return (
    <Card className="ai-glow p-[2rem] flex flex-col justify-center overflow-hidden relative">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-primary w-8 h-8 fill-primary" />
        <h4 className="font-headline-sm text-headline-sm text-on-surface">AI Insights</h4>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="p-4 rounded-xl bg-surface-container-high/40 border border-primary/20">
          <p className="text-on-surface font-body-md leading-relaxed">
            "You are most productive between 10 AM and 1 PM. Schedule your deep work sessions then."
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-high/40 border border-tertiary/20">
          <p className="text-on-surface font-body-md leading-relaxed">
            "3 tasks for Project 'Solaris' are overdue. Focus on these to maintain your 85% score."
          </p>
        </div>
        <button className="w-full mt-4 flex items-center justify-center gap-2 text-primary font-label-caps text-label-caps group">
          Full Analysis
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </Card>
  );
};

export default AIWidget;
