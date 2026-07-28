import React from 'react';
import { Clock, CheckCircle2, PlayCircle, XCircle, AlertCircle } from 'lucide-react';

const MeetingStatusBadge = ({ status }) => {
  let config = {
    bg: 'bg-surface-variant text-on-surface-variant border-outline-variant/30',
    icon: <Clock className="w-3.5 h-3.5" />,
    pulse: false
  };

  switch (status) {
    case 'Scheduled':
      config = {
        bg: 'bg-primary/10 text-primary border-primary/20',
        icon: <Clock className="w-3.5 h-3.5" />,
        pulse: false
      };
      break;
    case 'Starts Soon': // e.g. within 15 mins
      config = {
        bg: 'bg-secondary/10 text-secondary border-secondary/20',
        icon: <Clock className="w-3.5 h-3.5" />,
        pulse: true
      };
      break;
    case 'Live Now':
    case 'Ongoing':
      config = {
        bg: 'bg-tertiary/10 text-tertiary border-tertiary/20',
        icon: <PlayCircle className="w-3.5 h-3.5" />,
        pulse: true
      };
      break;
    case 'Completed':
      config = {
        bg: 'bg-surface-variant text-on-surface-variant border-outline-variant/30',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        pulse: false
      };
      break;
    case 'Cancelled':
      config = {
        bg: 'bg-error/10 text-error border-error/20',
        icon: <XCircle className="w-3.5 h-3.5" />,
        pulse: false
      };
      break;
    case 'Missed':
      config = {
        bg: 'bg-error-container/20 text-error border-error/20',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        pulse: false
      };
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-caps text-[10px] uppercase font-bold tracking-wider border ${config.bg}`}>
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.bg.split(' ')[0].replace('/10', '')}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.bg.split(' ')[0].replace('/10', '')}`}></span>
        </span>
      )}
      {!config.pulse && config.icon}
      {status}
    </span>
  );
};

export default MeetingStatusBadge;
