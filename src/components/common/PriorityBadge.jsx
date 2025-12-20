import React from 'react';
import { Flag, TrendingUp, AlertTriangle, Minus, ArrowDown } from 'lucide-react';

const PriorityBadge = ({ 
  priority, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  // Priority configuration
  const priorityConfig = {
    low: {
      label: 'Low Priority',
      color: 'gray',
      icon: ArrowDown,
      description: 'Low priority task'
    },
    medium: {
      label: 'Medium Priority',
      color: 'blue',
      icon: Minus,
      description: 'Medium priority task'
    },
    high: {
      label: 'High Priority',
      color: 'orange',
      icon: TrendingUp,
      description: 'High priority task'
    },
    urgent: {
      label: 'Urgent',
      color: 'red',
      icon: AlertTriangle,
      description: 'Urgent priority task - requires immediate attention'
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
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-600',
      icon: 'text-gray-600 dark:text-gray-400'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400'
    }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
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
      {showIcon && (
        <IconComponent className={`${iconSizeClasses[size]} ${colors.icon}`} />
      )}
      {config.label}
    </span>
  );
};

// Additional component for a more compact priority indicator
export const PriorityIndicator = ({ priority, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    low: 'bg-gray-400',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  const colors = colorClasses[priority] || colorClasses.medium;

  return (
    <div
      className={`
        rounded-full ${colors} ${sizeClasses[size]}
        ${className}
      `}
      title={config.label}
    />
  );
};

export default PriorityBadge;