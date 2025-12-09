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
  Settings,
  LogOut,
  LayoutGrid,
  Calendar,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  CheckSquare,
  ChevronRight,
  Loader2,
  Box,
  Clock as ClockIcon,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

// Contexts & Hooks
import { useEnhancedNotifications } from "./enhancedNotifications.jsx";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

// API Services
import {
  eventService,
  clientService,
  partnerService,
  invoiceService,
  paymentService,
  taskService,
  reminderService,
} from "../../api/index";

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

const NotificationBadge = ({ count }) => {
  if (count === 0) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[10px] font-bold text-white shadow-sm">
        {count > 9 ? "9+" : count}
      </span>
    </motion.span>
  );
};

const SearchResultItem = ({ item, onClick, config }) => {
  const Icon = config.icon;
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start gap-3 group transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
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

// ==========================================
// 2. SEARCH LOGIC HOOK
// ==========================================

const useSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults({});
        setShow(false);
        return;
      }
      setLoading(true);
      setShow(true);
      try {
        // Parallel fetching
        const [
          events,
          clients,
          partners,
          invoices,
          payments,
          tasks,
          reminders,
        ] = await Promise.allSettled([
          eventService.getAll({ search: query, limit: 3 }),
          clientService.getAll({ search: query, limit: 3 }),
          partnerService.getAll({ search: query, limit: 3 }),
          invoiceService.getAll({ search: query, limit: 3 }),
          paymentService.getAll({ search: query, limit: 3 }),
          taskService.getAll({ search: query, limit: 3 }),
          reminderService.getAll({ search: query, limit: 3 }),
        ]);

        const extract = (res) => {
          if (res.status !== "fulfilled") return [];
          const val = res.value;
          if (val?.data?.data) return val.data.data;
          if (val?.data) return Array.isArray(val.data) ? val.data : [];
          // Heuristic fallback for different API structures
          const keys = [
            "events",
            "clients",
            "partners",
            "invoices",
            "payments",
            "tasks",
            "reminders",
          ];
          for (const k of keys) {
            if (val[k]) return val[k];
            if (val.data && val.data[k]) return val.data[k];
          }
          return [];
        };

        const filter = (items, type) => {
          if (!items) return [];
          const q = query.toLowerCase();
          return items
            .filter((i) => {
              if (type === "invoices")
                return (
                  i.invoiceNumber?.toLowerCase().includes(q) ||
                  i.recipientName?.toLowerCase().includes(q)
                );
              if (type === "payments")
                return i.reference?.toLowerCase().includes(q);
              const text = i.title || i.name || i.company || "";
              return text.toLowerCase().includes(q);
            })
            .slice(0, 3);
        };

        setResults({
          events: filter(extract(events), "events"),
          clients: filter(extract(clients), "clients"),
          partners: filter(extract(partners), "partners"),
          invoices: filter(extract(invoices), "invoices"),
          payments: filter(extract(payments), "payments"),
          tasks: filter(extract(tasks), "tasks"),
          reminders: filter(extract(reminders), "reminders"),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, loading, show, setShow };
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const TopBar = ({ onMenuClick, isCollapsed, onToggleCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  // Enhanced Notifications Logic
  const {
    notifications,
    categorized,
    alertCount,
    preferences,
    updatePreferences,
    markAsComplete,
    dismissNotification,
  } = useEnhancedNotifications();

  // Search Logic
  const {
    query,
    setQuery,
    results: searchResults,
    loading: searchLoading,
    show: showSearch,
    setShow: setShowSearch,
  } = useSearch();

  // UI State
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Refs
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Global Listeners
  useEffect(() => {
    const handleProfileUpdate = () => refreshUser && refreshUser();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [refreshUser]);

  // Click Outside Handler
  useEffect(() => {
    const handleClick = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      )
        setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setShowSearch]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setShowSearch]);

  // Navigation Helper
  const handleResultClick = (type, id) => {
    setShowSearch(false);
    setQuery("");
    const routes = {
      events: `/events/${id}/detail`,
      clients: `/clients/${id}`,
      partners: `/partners/${id}`,
      invoices: `/invoices/${id}/edit`,
      payments: `/payments/${id}`,
      tasks: `/tasks/${id}`,
      reminders: `/reminders/${id}`,
      supplies: `/supplies/${id}`,
    };
    navigate(routes[type] || "/");
  };

  const getUserInitials = () =>
    user?.name
      ? user.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";

  const userAvatar = user?.avatar || null;
  const topBarOffset = isCollapsed
    ? isRTL
      ? "lg:right-16"
      : "lg:left-16"
    : isRTL
      ? "lg:right-56"
      : "lg:left-56";

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
    supplies: { icon: Box, color: "red", label: t("common.supplies") },
  };

  // ==========================================
  // RENDER NOTIFICATIONS
  // ==========================================

  const getSeverityColor = (reminder) => {
    const isOverdue = new Date(reminder.reminderDate) < new Date();
    if (isOverdue) return "bg-red-500";
    if (reminder.priority === "urgent") return "bg-orange-500";
    if (reminder.priority === "high") return "bg-yellow-500";
    if (reminder.type === "event") return "bg-blue-500";
    if (reminder.type === "payment") return "bg-green-500";
    return "bg-gray-400"; // Default
  };

  const renderNotificationDropdown = () => {
    const categoriesToShow = {
      all: notifications,
      overdue: categorized.overdue,
      critical: categorized.critical,
      today: categorized.today,
    };
    const currentList = categoriesToShow[selectedCategory] || [];

    return (
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`absolute mt-4 w-[400px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 ${isRTL ? "left-0" : "right-0"}`}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("notifications.title")}
                </h3>
                {alertCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-xs font-bold text-red-600 dark:text-red-400">
                    {alertCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/reminders");
                }}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 transition-colors"
              >
                {t("notifications.viewAll")}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              {[
                { key: "all", label: t("notifications.tabs.all") },
                {
                  key: "overdue",
                  label: t("notifications.tabs.overdue"),
                  count: categorized.overdue.length,
                },
                {
                  key: "critical",
                  label: t("notifications.tabs.critical"),
                  count: categorized.critical.length,
                },
                {
                  key: "today",
                  label: t("notifications.tabs.today"),
                  count: categorized.today.length,
                },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all relative ${
                    selectedCategory === key
                      ? "border-orange-500 text-orange-600 dark:text-orange-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {label}
                  {count > 0 && selectedCategory !== key && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto bg-white dark:bg-gray-800">
              {currentList.length > 0 ? (
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {currentList.map((rem) => (
                    <div
                      key={rem._id}
                      className="group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer flex gap-4"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(`/reminders/${rem._id}`);
                      }}
                    >
                      {/* The "Small Rectangle" Indicator */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(rem)}`}
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(rem)} bg-opacity-10`}
                        >
                          <ClockIcon
                            className={`w-4 h-4 ${getSeverityColor(rem).replace("bg-", "text-")}`}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p
                            className={`text-sm font-semibold truncate ${rem.status === "completed" ? "text-gray-500 line-through" : "text-gray-900 dark:text-white"}`}
                          >
                            {rem.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(rem.reminderDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {rem.description || t("notifications.noDescription")}
                        </p>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsComplete(rem._id);
                          }}
                          title={t("common.markAsDone")}
                          className="p-1 hover:bg-green-50 rounded text-green-600 dark:text-green-400"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(rem._id);
                          }}
                          title={t("common.dismiss")}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {t(`notifications.empty.${selectedCategory}`)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Settings */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">
                {t("notifications.settings.title")}
              </span>
              <div className="flex gap-4 mr-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-300 hover:text-orange-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.sound}
                    onChange={(e) =>
                      updatePreferences({ sound: e.target.checked })
                    }
                    className="rounded text-orange-500 focus:ring-orange-500/20 w-3.5 h-3.5"
                  />
                  {t("notifications.settings.sound")}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-300 hover:text-orange-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.desktop}
                    onChange={(e) =>
                      updatePreferences({ desktop: e.target.checked })
                    }
                    className="rounded text-orange-500 focus:ring-orange-500/20 w-3.5 h-3.5"
                  />
                  {t("notifications.settings.desktop")}
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <header
      className={`fixed top-0 ${isRTL ? "left-0 right-0" : "left-0 right-0"} h-16 bg-white/90 backdrop-blur-md z-40 transition-all duration-300 ${topBarOffset} dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* --- LEFT: MENU & LOGO --- */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
          <Link
            to="/home"
            className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <LayoutGrid className="w-5 h-5 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 transition-colors" />
          </Link>
          <Link to="/" className="lg:hidden block">
            <img
              src="/fiesta logo-01.png"
              className="h-8 w-auto"
              alt="Logo"
              onError={(e) => (e.target.style.display = "none")}
            />
          </Link>
        </div>

        {/* --- CENTER: SEARCH --- */}
        <div
          className="hidden md:flex flex-1 max-w-xl mx-8 relative"
          ref={searchContainerRef}
        >
          <div className="relative w-full">
            <div
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 pointer-events-none`}
            >
              {searchLoading ? (
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("common.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSearch(true)}
              className={`w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all ${isRTL ? "pr-10 pl-12 text-right" : "pl-10 pr-12 text-left"}`}
            />
            <div
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-500`}
            >
              ⌘K
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
              >
                {searchLoading ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    {t("common.loading")}
                  </div>
                ) : Object.keys(searchResults).every(
                    (k) => !searchResults[k]?.length
                  ) ? (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {t("common.noResults")}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {Object.entries(searchResults).map(([cat, items]) => {
                      if (!items || items.length === 0) return null;
                      const conf = categoryConfig[cat];
                      return (
                        <div key={cat}>
                          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase flex items-center gap-2 bg-gray-50 dark:bg-gray-900/30">
                            <conf.icon className="w-3 h-3" /> {conf.label}
                          </div>
                          {items.map((item) => (
                            <SearchResultItem
                              key={item._id}
                              item={item}
                              onClick={() => handleResultClick(cat, item._id)}
                              config={conf}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-orange-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <NotificationBadge count={alertCount} />
            </motion.button>
            {renderNotificationDropdown()}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {user?.role?.name || "Staff"}
                </p>
              </div>
              <div className="relative">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    className="w-9 h-9 rounded-lg object-cover bg-gray-200"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 ${isRTL ? "left-0" : "right-0"}`}
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Settings className="w-4 h-4" /> {t("common.settings")}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" /> {t("common.logout")}
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
