import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Calendar,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  IndianRupee
} from 'lucide-react';

export const getIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'message':
    case 'system notification':
      return <MessageSquare className="w-5 h-5 text-tertiary" />;
    case 'task':
    case 'new task':
    case 'task updated':
    case 'deadline reminder':
      return <Calendar className="w-5 h-5 text-error" />;
    case 'project':
    case 'new project':
    case 'task completed':
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-primary" />;
    case 'new client':
      return <FileText className="w-5 h-5 text-secondary" />;
    case 'payment received':
      return <IndianRupee className="w-5 h-5 text-primary" />;
    case 'payment pending':
      return <CreditCard className="w-5 h-5 text-error" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-tertiary" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-error" />;
    default:
      return <Bell className="w-5 h-5 text-on-surface-variant" />;
  }
};

export const getIconBg = (type) => {
  switch (type?.toLowerCase()) {
    case 'message':
    case 'system notification':
    case 'warning':
      return 'bg-tertiary/20';
    case 'task':
    case 'new task':
    case 'task updated':
    case 'deadline reminder':
    case 'payment pending':
    case 'error':
      return 'bg-error/20';
    case 'project':
    case 'new project':
    case 'task completed':
    case 'success':
    case 'payment received':
      return 'bg-primary/20';
    case 'new client':
      return 'bg-secondary/20';
    default:
      return 'bg-surface-variant';
  }
};
