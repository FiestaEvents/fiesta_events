import React from "react";
import {
  Bell,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  PartyPopper,
  Users,
  X,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Notifications = ({ onClose }) => {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "event",
      title: "New Event Booking",
      message: "Wedding - Smith Family scheduled for Nov 15, 2025",
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      icon: PartyPopper,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Received",
      message: "$5,000 payment received for Corporate Event",
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: CreditCard,
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: 3,
      type: "reminder",
      title: "Event Reminder",
      message: "Birthday Party setup starts in 2 hours",
      time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
      icon: Bell,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 4,
      type: "task",
      title: "Task Completed",
      message: 'John Doe completed "Setup Audio Equipment"',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      id: 5,
      type: "alert",
      title: "Payment Overdue",
      message: "Payment for Johnson Event is 2 days overdue",
      time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      id: 6,
      type: "team",
      title: "New Team Member",
      message: "Sarah Wilson joined your team as Staff",
      time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: Users,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification);
    // Navigate to relevant page based on notification type
    onClose();
  };

  const handleMarkAllAsRead = () => {
    console.log("Mark all as read");
    // API call to mark all notifications as read
  };

  const handleClearAll = () => {
    console.log("Clear all notifications");
    // API call to clear all notifications
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-[32rem] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  !notification.read
                    ? "bg-blue-50 dark:bg-blue-900/10 border-l-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 ${notification.iconBg} rounded-lg p-2 h-fit`}
                  >
                    <notification.icon
                      className={`h-5 w-5 ${notification.iconColor}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${
                          !notification.read
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                      {formatDistanceToNow(notification.time, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No notifications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You're all caught up!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
