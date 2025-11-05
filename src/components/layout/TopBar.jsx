import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { MenuIcon, BellIcon, SunIcon, MoonIcon } from "../icons/IconComponents";
import {
  Search,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { reminderService } from "../../api/index";

const TopBar = ({ onMenuClick, isCollapsed, onToggleCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef();
  const notificationRef = useRef();

  // Fetch upcoming reminders as notifications
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      if (!isMounted) return;

      try {
        const response = await reminderService.getUpcoming();

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

        const activeReminders = reminders.filter(
          (reminder) => reminder.status === "active"
        );

        if (isMounted) {
          setNotifications(activeReminders);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (isMounted) {
          setNotifications([]);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatReminderDate = (dateString, timeString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `${t("notifications.today")} ${timeString || ""}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${t("notifications.tomorrow")} ${timeString || ""}`;
    } else {
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${timeString || ""}`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "AV";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = () => {
    if (!user?.role) return t("common.user");
    if (typeof user.role === "string") {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    } else if (user.role?.name) {
      return user.role.name;
    }
    return t("common.user");
  };

  const getRoleColor = () => {
    const role = user?.role;
    const roleName = typeof role === "string" ? role : role?.name;

    switch (roleName?.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
<header
  className={`fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20 transition-all duration-300 ${
    isCollapsed ? "lg:left-16" : "lg:left-64"
  } dark:bg-gray-900 dark:border-gray-700`}
>
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
                <div className="relative h-22 w-15">
                  <img
                    src="/fiesta logo-01.png"
                    alt="Fiesta Logo"
                    className="h-20 w-30 "
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                t("common.searchPlaceholder") ||
                "Search events, clients, tasks..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t("common.toggleTheme")}
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() =>
                setNotificationDropdownOpen(!notificationDropdownOpen)
              }
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t("common.notifications")}
            >
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-30">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("notifications.upcomingReminders")}
                    </h3>
                    {notifications.length > 0 && (
                      <span className="text-xs font-semibold px-2 py-1 bg-red-500 text-white rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((reminder) => (
                      <div
                        key={reminder._id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => {
                          navigate("/reminders");
                          setNotificationDropdownOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {reminder.title ||
                                  t("notifications.untitledReminder")}
                              </p>
                              {reminder.priority && (
                                <span
                                  className={`text-xs font-semibold uppercase ${getPriorityColor(reminder.priority)}`}
                                >
                                  {reminder.priority}
                                </span>
                              )}
                            </div>
                            {reminder.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                                {reminder.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap flex-shrink-0">
                            {formatReminderDate(
                              reminder.reminderDate,
                              reminder.reminderTime
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("notifications.noReminders")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || t("common.user")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getUserRole()}
                </p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || t("common.user")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {user?.email}
                  </p>
                  {user?.role && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleColor()}`}
                    >
                      {getUserRole()}
                    </span>
                  )}
                </div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => {
                    navigate("/settings/profile");
                    setDropdownOpen(false);
                  }}
                >
                  <User className="w-4 h-4" />
                  {t("common.profile")}
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => {
                    navigate("/settings");
                    setDropdownOpen(false);
                  }}
                >
                  <SettingsIcon className="w-4 h-4" />
                  {t("common.settings")}
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("common.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
