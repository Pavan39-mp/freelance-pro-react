import React from 'react';
import * as Icons from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ title, value, subtitle, iconName, change, colorClass, bgColorClass }) => {
  const IconComponent = Icons[iconName] || Icons.HelpCircle;

  return (
    <Card className="group hover:border-primary/30">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColorClass} ${colorClass}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <span className={`font-label-caps text-label-caps ${colorClass}`}>{change}</span>
      </div>
      <p className="text-on-surface-variant font-label-caps text-label-caps mb-1 uppercase">{title}</p>
      <h3 className="text-headline-sm font-headline-sm text-on-surface">{value}</h3>
    </Card>
  );
};

export default StatCard;
