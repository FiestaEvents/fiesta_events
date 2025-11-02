import { 
  Bell, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  PartyPopper,
  Users,
  X 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Notifications = ({ onClose }) => {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'event',
      title: 'New Event Booking',
      message: 'Wedding - Smith Family scheduled for Nov 15, 2025',
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      icon: PartyPopper,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '$5,000 payment received for Corporate Event',
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: CreditCard,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Event Reminder',
      message: 'Birthday Party setup starts in 2 hours',
      time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
      icon: Bell,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      id: 4,
      type: 'task',
      title: 'Task Completed',
      message: 'John Doe completed "Setup Audio Equipment"',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      id: 5,
      type: 'alert',
      title: 'Payment Overdue',
      message: 'Payment for Johnson Event is 2 days overdue',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    {
      id: 6,
      type: 'team',
      title: 'New Team Member',
      message: 'Sarah Wilson joined your team as Staff',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: Users,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // Navigate to relevant page based on notification type
    onClose();
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
    // API call to mark all notifications as read
  };

  const handleClearAll = () => {
    console.log('Clear all notifications');
    // API call to clear all notifications
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Mark all as read
          </button>
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${notification.iconBg} rounded-full p-2`}>
                    <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="flex-shrink-0 h-2 w-2 bg-purple-600 rounded-full mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(notification.time, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No notifications</p>
            <p className="text-xs text-gray-400 mt-1">
              You're all caught up!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;