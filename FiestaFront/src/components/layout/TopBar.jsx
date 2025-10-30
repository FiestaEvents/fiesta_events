import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MenuIcon,
  BellIcon,
  PartyPopperIcon,
  SunIcon,
  MoonIcon,
} from '../icons/IconComponents';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { eventService } from '../../api/index'; // or notificationsService if exists

const TopBar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef();

  // Fetch notifications every 15 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Replace with your real notification service if exists
        const response = await eventService.getRecentEvents({ limit: 5 });
        setNotifications(response || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-20 w-full lg:w-[calc(100%-256px)] lg:left-64 dark:bg-gray-800 dark:border-gray-700">
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
            <PartyPopperIcon className="h-7 w-7 text-orange-500" />
            <span>Fiesta</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-2 rounded-full"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="relative text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white p-2 rounded-full">
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </button>
            {/* Dropdown */}
            {notifications.length > 0 && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notif, idx) => (
                    <li key={idx} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      {notif.title || 'New Notification'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500 text-white font-semibold text-sm cursor-pointer"
            >
              AV
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30">
                <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    Profile
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate('/support')}
                  >
                    Support
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={logout}
                  >
                    Logout
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
