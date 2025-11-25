import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { MenuIcon, BellIcon, SunIcon, MoonIcon } from "../icons/IconComponents";
import {
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
  Bell,
  Clock,
  TrendingUp,
  ChevronRight,
  Loader2
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
  taskService 
} from "../../api/index";
import AppLauncher from "./AppLauncher";

const TopBar = ({ onMenuClick, isCollapsed, onToggleCollapse }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  // --- STATE ---
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  
  // Search state
  const [searchResults, setSearchResults] = useState({
    events: [],
    clients: [],
    partners: [],
    invoices: [],
    payments: [],
    tasks: [],
    reminders: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // --- REFS ---
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const launcherToggleRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Calculate positioning
  const topBarOffset = isCollapsed 
    ? (isRTL ? "lg:right-20" : "lg:left-20")
    : (isRTL ? "lg:right-64" : "lg:left-64");

  // --- SEARCH LOGIC ---
  
  // Debounced search
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
          reminders: []
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
      // Search all entities in parallel
      const [events, clients, partners, invoices, payments, tasks, reminders] = await Promise.allSettled([
        eventService.getAll({ search: query, limit: 3 }),
        clientService.getAll({ search: query, limit: 3 }),
        partnerService.getAll({ search: query, limit: 3 }),
        invoiceService.getAll({ search: query, limit: 3 }),
        paymentService.getAll({ search: query, limit: 3 }),
        taskService.getAll({ search: query, limit: 3 }),
        reminderService.getAll({ search: query, limit: 3 })
      ]);

      // Extract and filter results client-side
      setSearchResults({
        events: filterBySearchQuery(
          events.status === 'fulfilled' ? extractData(events.value) : [],
          query,
          'events'
        ).slice(0, 3),
        clients: filterBySearchQuery(
          clients.status === 'fulfilled' ? extractData(clients.value) : [],
          query,
          'clients'
        ).slice(0, 3),
        partners: filterBySearchQuery(
          partners.status === 'fulfilled' ? extractData(partners.value) : [],
          query,
          'partners'
        ).slice(0, 3),
        invoices: filterBySearchQuery(
          invoices.status === 'fulfilled' ? extractData(invoices.value) : [],
          query,
          'invoices'
        ).slice(0, 3),
        payments: filterBySearchQuery(
          payments.status === 'fulfilled' ? extractData(payments.value) : [],
          query,
          'payments'
        ).slice(0, 3),
        tasks: filterBySearchQuery(
          tasks.status === 'fulfilled' ? extractData(tasks.value) : [],
          query,
          'tasks'
        ).slice(0, 3),
        reminders: filterBySearchQuery(
          reminders.status === 'fulfilled' ? extractData(reminders.value) : [],
          query,
          'reminders'
        ).slice(0, 3)
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
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.events && Array.isArray(response.events)) return response.events;
    if (response.clients && Array.isArray(response.clients)) return response.clients;
    if (response.partners && Array.isArray(response.partners)) return response.partners;
    if (response.invoices && Array.isArray(response.invoices)) return response.invoices;
    if (response.payments && Array.isArray(response.payments)) return response.payments;
    if (response.tasks && Array.isArray(response.tasks)) return response.tasks;
    if (response.reminders && Array.isArray(response.reminders)) return response.reminders;
    return [];
  };

  // Client-side filtering helper
  const filterBySearchQuery = (items, query, category) => {
    if (!query || !items || items.length === 0) return items;
    
    const searchLower = query.toLowerCase();
    
    return items.filter(item => {
      // Search in different fields based on category
      switch(category) {
        case 'events':
          return (item.title?.toLowerCase().includes(searchLower) ||
                  item.description?.toLowerCase().includes(searchLower) ||
                  item.type?.toLowerCase().includes(searchLower));
        
        case 'clients':
        case 'partners':
          return (item.name?.toLowerCase().includes(searchLower) ||
                  item.email?.toLowerCase().includes(searchLower) ||
                  item.phone?.includes(searchLower) ||
                  item.company?.toLowerCase().includes(searchLower));
        
        case 'invoices':
          return (item.invoiceNumber?.toLowerCase().includes(searchLower) ||
                  item.recipientName?.toLowerCase().includes(searchLower) ||
                  item.status?.toLowerCase().includes(searchLower));
        
        case 'payments':
          return (item.description?.toLowerCase().includes(searchLower) ||
                  item.reference?.toLowerCase().includes(searchLower) ||
                  item.status?.toLowerCase().includes(searchLower));
        
        case 'tasks':
          return (item.title?.toLowerCase().includes(searchLower) ||
                  item.description?.toLowerCase().includes(searchLower) ||
                  item.status?.toLowerCase().includes(searchLower) ||
                  item.category?.toLowerCase().includes(searchLower));
        
        case 'reminders':
          return (item.title?.toLowerCase().includes(searchLower) ||
                  item.description?.toLowerCase().includes(searchLower) ||
                  item.type?.toLowerCase().includes(searchLower));
        
        default:
          return false;
      }
    });
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleResultClick = (type, id) => {
    saveRecentSearch(searchQuery);
    setShowSearchResults(false);
    setSearchQuery("");
    
    const routes = {
      events: `/events/${id}/detail`,
      clients: `/clients/${id}`,
      partners: `/partners/${id}`,
      invoices: `/invoices/${id}/edit`,
      payments: `/payments/${id}`,
      tasks: `/tasks/${id}`,
      reminders: `/reminders/${id}`
    };
    
    navigate(routes[type]);
  };

  const saveRecentSearch = (query) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent);
  };

  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Click outside handler for search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to close search
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Count total results
  const totalResults = Object.values(searchResults).reduce((acc, arr) => acc + arr.length, 0);
  const hasResults = totalResults > 0;

  // Search result categories config
  const categoryConfig = {
    events: { icon: Calendar, color: 'blue', label: t('common.events', 'Events') },
    clients: { icon: Users, color: 'green', label: t('common.clients', 'Clients') },
    partners: { icon: Briefcase, color: 'purple', label: t('common.partners', 'Partners') },
    invoices: { icon: FileText, color: 'orange', label: t('common.invoices', 'Invoices') },
    payments: { icon: DollarSign, color: 'emerald', label: t('common.payments', 'Payments') },
    tasks: { icon: CheckSquare, color: 'indigo', label: t('common.tasks', 'Tasks') },
    reminders: { icon: Bell, color: 'yellow', label: t('common.reminders', 'Reminders') }
  };

  // --- NOTIFICATION LOGIC (keeping existing) ---
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (!isMounted) return;
      try {
        const response = await reminderService.getUpcoming();
        let reminders = [];
        if (response?.data?.data?.reminders) reminders = response.data.data.reminders;
        else if (response?.data?.reminders) reminders = response.data.reminders;
        else if (response?.reminders) reminders = response.reminders;
        else if (Array.isArray(response?.data)) reminders = response.data;
        else if (Array.isArray(response)) reminders = response;
        const activeReminders = reminders.filter(r => r.status === "active");
        if (isMounted) setNotifications(activeReminders);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (isMounted) setNotifications([]);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // --- HELPER FUNCTIONS (keeping existing) ---
  const formatReminderDate = (dateString, timeString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return `${t("notifications.today")} ${timeString || ""}`;
    else if (date.toDateString() === tomorrow.toDateString()) return `${t("notifications.tomorrow")} ${timeString || ""}`;
    else return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${timeString || ""}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "text-red-600 dark:text-red-400";
      case "high": return "text-orange-600 dark:text-orange-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-blue-600 dark:text-blue-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getUserInitials = () => user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "AV";
  const getUserRole = () => {
    const roleName = typeof user?.role === "string" ? user.role : user?.role?.name;
    return roleName ? roleName.charAt(0).toUpperCase() + roleName.slice(1) : t("common.user");
  };
  const getRoleColor = () => {
    const roleName = typeof user?.role === "string" ? user.role : user?.role?.name;
    switch (roleName?.toLowerCase()) {
      case "owner": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "staff": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <header className={`fixed top-0 ${isRTL ? 'left-0 right-0' : 'left-0 right-0'} h-16 bg-white border-b border-gray-200 z-20 transition-all duration-300 ${topBarOffset} dark:bg-gray-900 dark:border-gray-700`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2">
          <button onClick={onMenuClick} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={onToggleCollapse} className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            ref={launcherToggleRef}
            onClick={() => setIsLauncherOpen(!isLauncherOpen)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ml-1 ${
              isLauncherOpen 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            title={t("common.apps", "Apps")}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 lg:hidden ml-2">
            <div className="relative h-12 w-auto">
              <img src="/fiesta logo-01.png" alt="Fiesta Logo" className="h-full w-auto object-contain" onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          </Link>
        </div>

        {/* CENTER SECTION - ENHANCED SEARCH */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
          <div className="relative w-full">
            <button 
              onClick={handleSearchSubmit}
              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 p-1 hover:text-blue-500 transition-colors z-10`}
            >
              {searchLoading ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("common.searchPlaceholder", "Search events, clients, tasks...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) {
                  setShowSearchResults(true);
                }
              }}
              className={`w-full ${isRTL ? 'pr-10 pl-24' : 'pl-10 pr-24'} py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center gap-1`}>
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                K
              </kbd>
            </div>
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showSearchResults && (
            <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[600px] overflow-y-auto`}>
              {searchLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("common.searching", "Searching...")}
                  </p>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {t("common.searchMinChars", "Type at least 2 characters to search")}
                  </p>
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {t("common.recentSearches", "Recent Searches")}
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((recent, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(recent)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            {recent}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : !hasResults ? (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("common.noResults", "No results found for")} "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {t("common.foundResults", "Found")} {totalResults} {t("common.results", "results")}
                    </p>
                  </div>
                  
                  {Object.entries(searchResults).map(([category, items]) => {
                    if (items.length === 0) return null;
                    const config = categoryConfig[category];
                    const Icon = config.icon;
                    
                    return (
                      <div key={category} className="py-2">
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </p>
                        </div>
                        {items.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => handleResultClick(category, item._id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.title || item.name || item.invoiceNumber || item.description || 'Untitled'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {category === 'events' && item.type}
                                  {category === 'clients' && item.email}
                                  {category === 'partners' && item.category}
                                  {category === 'invoices' && `${item.status} • ${item.totalAmount || 0} TND`}
                                  {category === 'payments' && `${item.status} • ${item.amount || 0} TND`}
                                  {category === 'tasks' && item.status}
                                  {category === 'reminders' && formatReminderDate(item.reminderDate, item.reminderTime)}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                  
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {t("common.seeAllResults", "See all results")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SECTION (keeping existing) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === "light" ? <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
          </button>

          {/* Notifications */}
          <div className="relative z-50" ref={notificationRef}>
            <button onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {notifications.length > 0 && <span className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 bg-red-500 rounded-full`}></span>}
            </button>
            {notificationDropdownOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-30`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("notifications.upcomingReminders")}</h3>
                    {notifications.length > 0 && <span className="text-xs font-semibold px-2 py-1 bg-red-500 text-white rounded-full">{notifications.length}</span>}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((reminder) => (
                    <div key={reminder._id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0" onClick={() => { navigate("/reminders"); setNotificationDropdownOpen(false); }}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{reminder.title || t("notifications.untitledReminder")}</p>
                            {reminder.priority && <span className={`text-xs font-semibold uppercase ${getPriorityColor(reminder.priority)}`}>{reminder.priority}</span>}
                          </div>
                          {reminder.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">{reminder.description}</p>}
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap flex-shrink-0">{formatReminderDate(reminder.reminderDate, reminder.reminderTime)}</span>
                      </div>
                    </div>
                  )) : <div className="px-4 py-8 text-center"><p className="text-sm text-gray-500 dark:text-gray-400">{t("notifications.noReminders")}</p></div>}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className={`flex items-center gap-3 ${isRTL ? 'pr-3 pl-2' : 'pl-3 pr-2'} py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}>
              <div className={`hidden sm:block ${isRTL ? 'text-left' : 'text-right'}`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || t("common.user")}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getUserRole()}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>
            {dropdownOpen && (
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || t("common.user")}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                  {user?.role && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleColor()}`}>{getUserRole()}</span>}
                </div>
                <button className={`w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`} onClick={() => { navigate("/settings"); setDropdownOpen(false); }}>
                  <User className="w-4 h-4" /> {t("common.profile")}
                </button>
                <button className={`w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`} onClick={() => { navigate("/settings"); setDropdownOpen(false); }}>
                  <Settings className="w-4 h-4" /> {t("common.settings")}
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                  <button className={`w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`} onClick={() => { logout(); setDropdownOpen(false); }}>
                    <LogOut className="w-4 h-4" /> {t("common.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AppLauncher 
        isOpen={isLauncherOpen} 
        onClose={() => setIsLauncherOpen(false)} 
        toggleRef={launcherToggleRef} 
      />
    </header>
  );
};

export default TopBar;