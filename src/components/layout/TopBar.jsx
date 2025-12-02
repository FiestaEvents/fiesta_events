import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutGrid,
  Calendar,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  CheckSquare,
  AlertCircle,
  ChevronRight,
  Loader2,
  Command,
  Clock,
  TrendingUp,
  Sparkles,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  reminderService,
  eventService,
  clientService,
  partnerService,
  invoiceService,
  paymentService,
  taskService,
} from "../../api/index";

// ✅ Animated Badge Component
const NotificationBadge = ({ count }) => {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[10px] font-bold text-white">
        {count > 9 ? "9+" : count}
      </span>
    </motion.span>
  );
};

// ✅ Search Result Item Component
const SearchResultItem = ({ item, category, onClick, config }) => {
  const Icon = config.icon;

  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start gap-3 group transition-colors"
    >
      <div
        className={`p-2 rounded-lg bg-${config.color}-50 dark:bg-${config.color}-900/20 group-hover:scale-110 transition-transform`}
      >
        <Icon
          className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`}
        />
      </div>

      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {item.title || item.name || item.invoiceNumber}
        </p>
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </motion.button>
  );
};

// ✅ Notification Item Component
const NotificationItem = ({ reminder, onClick, isRTL }) => {
  const getPriorityConfig = (priority) => {
    const configs = {
      urgent: {
        color: "red",
        icon: AlertCircle,
        bg: "bg-red-50 dark:bg-red-900/20",
      },
      high: {
        color: "orange",
        icon: TrendingUp,
        bg: "bg-orange-50 dark:bg-orange-900/20",
      },
      medium: {
        color: "yellow",
        icon: Clock,
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
      },
      low: { color: "blue", icon: Zap, bg: "bg-blue-50 dark:bg-blue-900/20" },
    };
    return configs[priority?.toLowerCase()] || configs.medium;
  };

  const config = getPriorityConfig(reminder.priority);
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${config.bg}`}
    >
      <div className="flex gap-3">
        <div
          className={`p-2 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/30 flex-shrink-0`}
        >
          <Icon
            className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {reminder.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] text-${config.color}-600 dark:text-${config.color}-400 uppercase font-bold tracking-wider`}
            >
              {reminder.priority}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatReminderDate(reminder.reminderDate, reminder.reminderTime)}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 self-center" />
      </div>
    </motion.div>
  );
};

// Helper function
const formatReminderDate = (dateString, timeString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today ${timeString || ""}`;
  }
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${timeString || ""}`;
};

const TopBar = ({ onMenuClick, isCollapsed, onToggleCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  // --- STATE ---
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    events: [],
    clients: [],
    partners: [],
    invoices: [],
    payments: [],
    tasks: [],
    reminders: [],
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // --- REFS ---
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const audioRef = useRef(null);
  const prevNotificationCount = useRef(0);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
  }, []);

  const topBarOffset = isCollapsed
    ? isRTL
      ? "lg:right-16"
      : "lg:left-16"
    : isRTL
      ? "lg:right-48"
      : "lg:left-48";

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        await performSearch(searchQuery);
      } else {
        setSearchResults({
          events: [],
          clients: [],
          partners: [],
          invoices: [],
          payments: [],
          tasks: [],
          reminders: [],
        });
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      const [events, clients, partners, invoices, payments, tasks, reminders] =
        await Promise.allSettled([
          eventService.getAll({ search: query, limit: 3 }),
          clientService.getAll({ search: query, limit: 3 }),
          partnerService.getAll({ search: query, limit: 3 }),
          invoiceService.getAll({ search: query, limit: 3 }),
          paymentService.getAll({ search: query, limit: 3 }),
          taskService.getAll({ search: query, limit: 3 }),
          reminderService.getAll({ search: query, limit: 3 }),
        ]);

      const processResult = (res, type) =>
        res.status === "fulfilled"
          ? filterBySearchQuery(extractData(res.value), query, type).slice(0, 3)
          : [];

      setSearchResults({
        events: processResult(events, "events"),
        clients: processResult(clients, "clients"),
        partners: processResult(partners, "partners"),
        invoices: processResult(invoices, "invoices"),
        payments: processResult(payments, "payments"),
        tasks: processResult(tasks, "tasks"),
        reminders: processResult(reminders, "reminders"),
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data))
      return response.data.data;

    const keys = [
      "events",
      "clients",
      "partners",
      "invoices",
      "payments",
      "tasks",
      "reminders",
    ];
    for (const key of keys) {
      if (response[key] && Array.isArray(response[key])) return response[key];
      if (
        response.data &&
        response.data[key] &&
        Array.isArray(response.data[key])
      )
        return response.data[key];
    }
    return [];
  };

  const filterBySearchQuery = (items, query, category) => {
    if (!query || !items || items.length === 0) return items;
    const searchLower = query.toLowerCase();

    return items.filter((item) => {
      switch (category) {
        case "events":
          return (
            item.title?.toLowerCase().includes(searchLower) ||
            item.type?.toLowerCase().includes(searchLower)
          );
        case "clients":
        case "partners":
          return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.company?.toLowerCase().includes(searchLower)
          );
        case "invoices":
          return (
            item.invoiceNumber?.toLowerCase().includes(searchLower) ||
            item.recipientName?.toLowerCase().includes(searchLower)
          );
        case "payments":
          return item.reference?.toLowerCase().includes(searchLower);
        case "tasks":
        case "reminders":
          return item.title?.toLowerCase().includes(searchLower);
        default:
          return false;
      }
    });
  };

  const handleResultClick = (type, id) => {
    setShowSearchResults(false);
    setSearchQuery("");
    const routes = {
      events: `/events/${id}/detail`,
      clients: `/clients/${id}`,
      partners: `/partners/${id}`,
      invoices: `/invoices/${id}/edit`,
      payments: `/payments/${id}`,
      tasks: `/tasks/${id}`,
      reminders: `/reminders/${id}`,
    };
    navigate(routes[type] || "/");
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowSearchResults(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setDropdownOpen(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      )
        setNotificationDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch notifications
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (!isMounted) return;
      try {
        const response = await reminderService.getUpcoming();
        let reminders = [];
        if (response?.data?.data?.reminders)
          reminders = response.data.data.reminders;
        else if (response?.data?.reminders) reminders = response.data.reminders;
        else if (Array.isArray(response)) reminders = response;

        const activeReminders = reminders.filter((r) => r.status === "active");
        if (isMounted) setNotifications(activeReminders);
      } catch (error) {
        if (isMounted) setNotifications([]);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Play notification sound
  useEffect(() => {
    if (
      notifications.length > prevNotificationCount.current &&
      audioRef.current
    ) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.log("Sound autoplay blocked:", e));
    }
    prevNotificationCount.current = notifications.length;
  }, [notifications.length]);

  const getUserInitials = () => {
    return user?.name
      ? user.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";
  };

  const totalResults = Object.values(searchResults).reduce(
    (acc, arr) => acc + arr.length,
    0
  );
  const hasResults = totalResults > 0;

  const categoryConfig = {
    events: { icon: Calendar, color: "blue", label: t("common.events") },
    clients: { icon: Users, color: "green", label: t("common.clients") },
    partners: { icon: Briefcase, color: "purple", label: t("common.partners") },
    invoices: { icon: FileText, color: "orange", label: t("common.invoices") },
    payments: {
      icon: DollarSign,
      color: "emerald",
      label: t("common.payments"),
    },
    tasks: { icon: CheckSquare, color: "indigo", label: t("common.tasks") },
    reminders: { icon: Bell, color: "yellow", label: t("common.reminders") },
  };

  return (
    <header
      className={`fixed top-0 ${isRTL ? "left-0 right-0" : "left-0 right-0"} h-14 bg-white/95 backdrop-blur-md shadow-sm z-50 transition-all duration-300 ${topBarOffset} dark:bg-gray-900/95`}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {/* Desktop Collapse Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {/* Home Link */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/home"
              className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
            >
              <LayoutGrid className="h-5 w-5 text-gray-500 group-hover:text-orange-600 dark:text-gray-400 dark:group-hover:text-orange-500 transition-colors" />
            </Link>
          </motion.div>

          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden ml-2">
            <img
              src="/fiesta logo-01.png"
              alt="Fiesta"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Link>
        </div>

        {/* CENTER - SEARCH */}
        <div
          className="hidden md:flex flex-1 max-w-2xl mx-8 relative"
          ref={searchRef}
        >
          <div className="relative w-full">
            {/* Search Icon */}
            <div
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 pointer-events-none`}
            >
              {searchLoading ? (
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("common.searchPlaceholder", "Search anything...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowSearchResults(true);
              }}
              className={`w-full ${isRTL ? "pr-10 pl-24" : "pl-10 pr-24"} py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-750 transition-all ${isRTL ? "text-right" : "text-left"}`}
              dir={isRTL ? "rtl" : "ltr"}
            />

            {/* Keyboard Shortcut Hint */}
            <div
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600`}
            >
              <Command className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                K
              </span>
            </div>
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-full ${isRTL ? "right-0" : "left-0"} mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[600px] overflow-y-auto`}
              >
                {searchLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Searching...
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Results Header */}
                    {hasResults && (
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            Found {totalResults} result
                            {totalResults !== 1 ? "s" : ""}
                          </p>
                          <button
                            onClick={() => setShowSearchResults(false)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Results by Category */}
                    {hasResults ? (
                      Object.entries(searchResults).map(([category, items]) => {
                        if (items.length === 0) return null;
                        const config = categoryConfig[category];

                        return (
                          <div key={category} className="py-2">
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                              <config.icon className="w-3 h-3" />
                              {config.label}
                            </div>
                            {items.map((item) => (
                              <SearchResultItem
                                key={item._id}
                                item={item}
                                category={category}
                                config={config}
                                onClick={() =>
                                  handleResultClick(category, item._id)
                                }
                              />
                            ))}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          No results found
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Try searching with different keywords
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden w-9 h-9"
          >
            <AnimatePresence mode="wait">
              {theme === "light" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sun className="h-5 w-5 text-orange-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Moon className="h-5 w-5 text-blue-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setNotificationDropdownOpen(!notificationDropdownOpen)
              }
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <motion.div
                animate={
                  notifications.length > 0
                    ? {
                        rotate: [0, -10, 10, -10, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  repeat: notifications.length > 0 ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </motion.div>
              <NotificationBadge count={notifications.length} />
            </motion.button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notificationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t(
                          "notifications.upcomingReminders",
                          "Upcoming Reminders"
                        )}
                      </h3>
                    </div>
                    {notifications.length > 0 && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((reminder) => (
                        <NotificationItem
                          key={reminder._id}
                          reminder={reminder}
                          isRTL={isRTL}
                          onClick={() => {
                            navigate("/reminders");
                            setNotificationDropdownOpen(false);
                          }}
                        />
                      ))
                    ) : (
                      <div className="px-4 py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(
                            "notifications.noReminders",
                            "No upcoming reminders"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <button
                        onClick={() => {
                          navigate("/reminders");
                          setNotificationDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                      >
                        View all reminders
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-3 ${isRTL ? "pr-3 pl-2" : "pl-3 pr-2"} py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            >
              {/* User Info */}
              <div
                className={`hidden sm:block ${isRTL ? "text-left" : "text-right"}`}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name || t("common.user")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role?.name || user?.role || "Staff"}
                </p>
              </div>

              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md ring-2 ring-orange-500/20">
                  <span className="text-white font-bold text-sm">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {/* Profile Section */}
                  <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name || t("common.user")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {t("common.settings")}
                    </button>
                  </div>

                  {/* Logout */}
                  <div>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("common.logout")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;