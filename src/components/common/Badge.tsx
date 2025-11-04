
import React from 'react';

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
}

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
  yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-400/20',
  red: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-400/20',
};

const Badge: React.FC<BadgeProps> = ({ children, color = 'gray' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
