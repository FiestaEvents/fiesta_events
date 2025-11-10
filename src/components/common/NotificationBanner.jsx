import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationBanner = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  showCloseButton = true,
  className = '' 
}) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[type]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {icons[type]}
          </div>
          <div className="flex-1">
            {title && (
              <h4 className="text-sm font-semibold mb-1">
                {title}
              </h4>
            )}
            <p className="text-sm">
              {message}
            </p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-3"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;