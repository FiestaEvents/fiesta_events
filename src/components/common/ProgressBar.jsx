import React from 'react';

const ProgressBar = ({ 
  value = 0, 
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  labelPosition = 'right',
  className = ''
}) => {
  // Validate value
  const progressValue = Math.min(Math.max(value, 0), max);
  const percentage = (progressValue / max) * 100;

  // Size classes
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  // Color classes
  const colorClasses = {
    primary: 'bg-orange-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    gray: 'bg-gray-500'
  };

  const bgColorClasses = {
    primary: 'bg-orange-100 dark:bg-orange-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    gray: 'bg-gray-100 dark:bg-gray-700'
  };

  const textColorClasses = {
    primary: 'text-orange-700 dark:text-orange-300',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300',
    gray: 'text-gray-700 dark:text-gray-300'
  };

  const ProgressLabel = () => (
    <span className={`text-sm font-medium ${textColorClasses[color]}`}>
      {Math.round(percentage)}%
    </span>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Label on left */}
      {showLabel && labelPosition === 'left' && <ProgressLabel />}
      
      {/* Progress bar */}
      <div className={`flex-1 ${bgColorClasses[color]} rounded-full overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>

      {/* Label on right or inside */}
      {showLabel && (labelPosition === 'right' || labelPosition === 'inside') && (
        labelPosition === 'inside' ? (
          <div className="relative flex-1">
            <div className={`${bgColorClasses[color]} rounded-full overflow-hidden ${sizeClasses[size]}`}>
              <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ProgressLabel />
            </div>
          </div>
        ) : (
          <ProgressLabel />
        )
      )}
    </div>
  );
};

export default ProgressBar;