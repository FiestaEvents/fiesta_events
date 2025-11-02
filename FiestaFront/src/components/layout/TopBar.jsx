import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import {
  MenuIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from '../icons/IconComponents';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { reminderService } from '../../api/index';

const TopBar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const dropdownRef = useRef();
  const notificationRef = useRef();

  // Fetch upcoming reminders as notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get upcoming reminders
        const response = await reminderService.getUpcoming();

        // Extract reminders from response
        let reminders = [];
        if (response?.data?.data?.reminders) {
          reminders = response.data.data.reminders;
        } else if (response?.data?.reminders) {
          reminders = response.data.reminders;
        } else if (response?.reminders) {
          reminders = response.reminders;
        } else if (Array.isArray(response?.data)) {
          reminders = response.data;
        } else if (Array.isArray(response)) {
          reminders = response;
        }

        // Filter only active reminders
        const activeReminders = reminders.filter(
          reminder => reminder.status === 'active'
        );

        setNotifications(activeReminders);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Close user dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatReminderDate = (dateString, timeString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return `${t('notifications.today')} ${timeString || ''}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${t('notifications.tomorrow')} ${timeString || ''}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeString || ''}`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'AV';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user role display name
  const getUserRole = () => {
    if (!user?.role) return t('common.user');
    
    // Handle both string role and role object
    if (typeof user.role === 'string') {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    } else if (user.role?.name) {
      return user.role.name;
    }
    
    return t('common.user');
  };

  // Get role badge color
  const getRoleColor = () => {
    const role = user?.role;
    const roleName = typeof role === 'string' ? role : role?.name;
    
    switch (roleName?.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <header className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-16 bg-white border-b border-gray-200 z-20 w-full lg:w-[calc(100%-256px)] ${isRTL ? 'lg:right-64' : 'lg:left-64'} dark:bg-gray-800 dark:border-gray-700`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 dark:text-gray-300 mr-4"
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white lg:hidden"
          >
            {/* Logo from public folder */}
            <img 
              src="/fiesta logo-01.png" 
              alt="Fiesta Logo" 
              className="h-7 w-7 object-contain"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-2 rounded-full"
            aria-label={t('common.toggleTheme')}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="relative text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-2 rounded-full"
              aria-label={t('common.notifications')}
            >
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('notifications.upcomingReminders')}
                  </h3>
                </div>
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto">
                    {notifications.map((reminder) => (
                      <li 
                        key={reminder._id} 
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          navigate('/reminders');
                          setNotificationDropdownOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {reminder.title || t('notifications.untitledReminder')}
                              </p>
                              {reminder.priority && (
                                <span className={`text-xs font-semibold uppercase ${getPriorityColor(reminder.priority)}`}>
                                  {reminder.priority}
                                </span>
                              )}
                            </div>
                            {reminder.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                                {reminder.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {reminder.type && (
                                <span className="capitalize">{reminder.type}</span>
                              )}
                              {reminder.relatedEvent?.title && (
                                <span> • {t('common.event')}: {reminder.relatedEvent.title}</span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs text-orange-600 dark:text-orange-400 whitespace-nowrap flex-shrink-0">
                            {formatReminderDate(reminder.reminderDate, reminder.reminderTime)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('notifications.noReminders')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500 text-white font-semibold text-sm cursor-pointer hover:bg-orange-600 transition-colors"
              aria-label={t('common.userMenu')}
            >
              {getUserInitials()}
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || t('common.user')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor()}`}>
                      {getUserRole()}
                    </span>
                  </div>
                </div>
                <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      navigate('/settings/profile');
                      setDropdownOpen(false);
                    }}
                  >
                    {t('common.profile')}
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      navigate('/settings');
                      setDropdownOpen(false);
                    }}
                  >
                    {t('common.settings')}
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      navigate('/support');
                      setDropdownOpen(false);
                    }}
                  >
                    {t('common.support')}
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-red-600 dark:text-red-400"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    {t('common.logout')}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;