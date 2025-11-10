import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Bell } from 'lucide-react';

const NotificationItem = ({ notification, onClose, onMarkAsRead }) => {
  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  };

  const styles = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${styles[notification.type]}`}>
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-white">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatTime(notification.timestamp)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark read
            </button>
          )}
          <button
            onClick={() => onClose(notification.id)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationList = ({ 
  notifications = [], 
  onClose, 
  onMarkAsRead,
  onMarkAllAsRead,
  title = "Notifications",
  maxHeight = "400px"
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-80">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;