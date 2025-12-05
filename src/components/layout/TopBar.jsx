import React, { useState, useEffect, useRef, useCallback } from "react";
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
  AlertCircle,
  ChevronRight,
  Loader2,
  Command,
  TrendingUp,
  Clock,
  Sparkles,
  X,
  ArrowRight,
  Zap,
  Box,
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

// ==========================================
// 1. SUB-COMPONENTS
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
      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[10px] font-bold text-white">
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

// ==========================================
// 2. HOOKS & LOGIC
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
          // Robust extraction logic
          if (val?.data?.data) return val.data.data;
          if (val?.data) return Array.isArray(val.data) ? val.data : [];
          // Specific keys fallback
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
              // Basic fuzzy search logic per type
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

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [alertCount, setAlertCount] = useState(0); // Count for the Red Badge
  const audioRef = useRef(new Audio("/sounds/notification.mp3"));
  const prevAlertCount = useRef(0);

  const fetch = useCallback(async () => {
    try {
      const res = await reminderService.getUpcoming();
      let list = [];
      if (res?.data?.data?.reminders) list = res.data.data.reminders;
      else if (res?.data?.reminders) list = res.data.reminders;
      else if (Array.isArray(res)) list = res;

      const now = new Date();

      // Process list
      const processed = list
        .map((r) => {
          // 1. Parse Date Safely (Local Time)
          try {
            const dateOnly = r.reminderDate.split("T")[0]; // YYYY-MM-DD
            const [y, m, d] = dateOnly.split("-").map(Number);
            const [h, min] = (r.reminderTime || "00:00").split(":").map(Number);
            const due = new Date(y, m - 1, d, h, min);

            // Calculate difference in hours
            const diffMs = due - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            // 2. Logic: "If it past, it pass"
            // We hide items that are more than 30 mins past due (to clean up the list)
            if (diffHours < -24) return null; 

            // 3. Determine Urgency
            let urgency = "future"; // Grey
            let shouldAlert = false;

            if (diffHours <= 0) {
              urgency = "due"; // Red (It's time!)
              shouldAlert = true;
            } else if (diffHours <= 1) {
              urgency = "1h"; // Orange
              shouldAlert = true;
            } else if (diffHours <= 4) {
              urgency = "4h"; // Yellow
              shouldAlert = true;
            } else if (diffHours <= 24) {
              urgency = "1d"; // Blue
              shouldAlert = true;
            }

            return { ...r, due, diffHours, urgency, shouldAlert };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean); // Remove nulls (past items)

      setNotifications(processed);

      // 4. Calculate Badge Count (Only alert for 24h or less)
      const count = processed.filter(r => r.shouldAlert).length;
      setAlertCount(count);

    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000); // Check every 5sec
    return () => clearInterval(interval);
  }, [fetch]);

  // 5. Sound Effect Logic
  useEffect(() => {
    if (alertCount > prevAlertCount.current) {
      audioRef.current?.play().catch((e) => console.log("Audio blocked", e));
    }
    prevAlertCount.current = alertCount;
  }, [alertCount]);

  return { notifications, alertCount };
};

// ==========================================
// NOTIFICATION ITEM UI
// ==========================================
const NotificationItem = ({ reminder, onClick }) => {
  
  // Helper to show readable "Time Left"
  const getTimeLeft = () => {
    const h = Math.floor(reminder.diffHours);
    const m = Math.floor((reminder.diffHours - h) * 60);

    if (reminder.diffHours < 0) return "Due Now!";
    if (reminder.diffHours < 1) return `In ${Math.max(0, Math.floor(reminder.diffHours * 60))} mins`;
    if (reminder.diffHours < 24) return `In ${h}h ${m}m`;
    
    // For > 24h, show date
    return new Date(reminder.due).toLocaleDateString("en-GB", { 
      day: 'numeric', month: 'short' 
    }) + ` at ${reminder.reminderTime}`;
  };

  // Color Coding based on Urgency
  const getColors = () => {
    switch (reminder.urgency) {
      case "due": return "bg-red-100 text-red-700 border-l-4 border-red-500";
      case "1h": return "bg-orange-50 text-orange-700 border-l-4 border-orange-500";
      case "4h": return "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500";
      case "1d": return "bg-blue-50 text-blue-700 border-l-4 border-blue-500";
      default: return "bg-white text-gray-700 hover:bg-gray-50"; // Future > 24h
    }
  };
    return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`px-4 py-4 border-b border-gray-100 cursor-pointer flex items-center gap-4 transition-all ${getColors()}`}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="text-base font-bold leading-tight">
            {reminder.title}
          </p>
          {reminder.shouldAlert && (
            <span className="text-[10px] uppercase font-black tracking-widest opacity-80 bg-white/50 px-2 py-0.5 rounded">
              {reminder.urgency === 'due' ? 'NOW' : reminder.urgency}
            </span>
          )}
        </div>
        <p className="text-sm opacity-80 mt-1 font-medium">
          {getTimeLeft()}
        </p>
      </div>
      <ChevronRight size={20} className="opacity-50" />
    </motion.div>
  );
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
  const { notifications, alertCount } = useNotifications(); 
  // Custom Hooks
  const {
    query,
    setQuery,
    results: searchResults,
    loading: searchLoading,
    show: showSearch,
    setShow: setShowSearch,
  } = useSearch();

  // Local UI State
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Refs for click outside
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);

  // Global Events
  useEffect(() => {
    const handleProfileUpdate = () => refreshUser && refreshUser();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [refreshUser]);

  // Click Outside
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

  // Keyboard
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

  // Helpers
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
      ? "lg:right-48"
      : "lg:left-48";

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

  const totalResults = Object.values(searchResults).reduce(
    (acc, arr) => acc + (arr ? arr.length : 0),
    0
  );
  const hasResults = totalResults > 0;

  return (
    <header
      className={`fixed top-0 ${isRTL ? "left-0 right-0" : "left-0 right-0"} h-16 bg-white/90 backdrop-blur-md z-50 transition-all duration-300 ${topBarOffset} dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* --- LEFT: TOGGLE & LOGO --- */}
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
              placeholder={t("common.searchPlaceholder", "Search...")}
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
                className={`absolute top-full w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto`}
              >
                {searchLoading ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Searching...
                  </div>
                ) : !hasResults ? (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No results found.</p>
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

          {/* Theme */}
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

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <NotificationBadge count={alertCount} /> 
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className={`absolute mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 ${isRTL ? "left-0" : "right-0"}`}
                >
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      {t(
                        "notifications.upcomingReminders",
                        "Upcoming Reminders"
                      )}
                    </h3>
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((rem) => (
                        <NotificationItem
                          key={rem._id}
                          reminder={rem}
                          onClick={() => {
                            setNotifOpen(false);
                            navigate("/reminders");
                          }}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">No active Reminders right now.</p>
                      </div>
                    )}
                  </div>
                  {alertCount > 0 && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/reminders");
                        }}
                        className="w-full py-2 text-sm text-center text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View All
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
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
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
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
