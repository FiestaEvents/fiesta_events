import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  PauseCircle, 
  XCircle,
  Ban
} from 'lucide-react';

const StatusBadge = ({ 
  status, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  // Status configuration
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'yellow',
      icon: Clock,
      description: 'Task is waiting to be started'
    },
    todo: {
      label: 'To Do',
      color: 'blue',
      icon: Clock,
      description: 'Task is ready to be worked on'
    },
    in_progress: {
      label: 'In Progress',
      color: 'orange',
      icon: PlayCircle,
      description: 'Task is currently being worked on'
    },
    completed: {
      label: 'Completed',
      color: 'green',
      icon: CheckCircle,
      description: 'Task has been completed'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'gray',
      icon: XCircle,
      description: 'Task has been cancelled'
    },
    blocked: {
      label: 'Blocked',
      color: 'red',
      icon: Ban,
      description: 'Task is blocked and cannot proceed'
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Color classes
  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-600'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;
  const colors = colorClasses[config.color];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${colors.bg} ${colors.text} ${colors.border}
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && <IconComponent className={iconSizeClasses[size]} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;