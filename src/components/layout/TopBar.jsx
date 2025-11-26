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

  // Search state
  const [searchResults, setSearchResults] = useState({
    events: [], clients: [], partners: [], invoices: [], payments: [], tasks: [], reminders: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // --- REFS ---
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Audio Ref for Notification Sound
  const audioRef = useRef(new Audio("/sounds/notification.mp3")); 
  const prevNotificationCount = useRef(0);

  // Calculate positioning
  const topBarOffset = isCollapsed
    ? (isRTL ? "lg:right-20" : "lg:left-20")
    : (isRTL ? "lg:right-64" : "lg:left-64");

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        await performSearch(searchQuery);
      } else {
        setSearchResults({
          events: [], clients: [], partners: [], invoices: [], payments: [], tasks: [], reminders: []
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
      const [events, clients, partners, invoices, payments, tasks, reminders] = await Promise.allSettled([
        eventService.getAll({ search: query, limit: 3 }),
        clientService.getAll({ search: query, limit: 3 }),
        partnerService.getAll({ search: query, limit: 3 }),
        invoiceService.getAll({ search: query, limit: 3 }),
        paymentService.getAll({ search: query, limit: 3 }),
        taskService.getAll({ search: query, limit: 3 }),
        reminderService.getAll({ search: query, limit: 3 })
      ]);

      const processResult = (res, type) => 
        res.status === 'fulfilled' ? filterBySearchQuery(extractData(res.value), query, type).slice(0, 3) : [];

      setSearchResults({
        events: processResult(events, 'events'),
        clients: processResult(clients, 'clients'),
        partners: processResult(partners, 'partners'),
        invoices: processResult(invoices, 'invoices'),
        payments: processResult(payments, 'payments'),
        tasks: processResult(tasks, 'tasks'),
        reminders: processResult(reminders, 'reminders')
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
    // Check common data wrappers
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    
    // Check named keys
    const keys = ['events', 'clients', 'partners', 'invoices', 'payments', 'tasks', 'reminders'];
    for (const key of keys) {
      if (response[key] && Array.isArray(response[key])) return response[key];
      if (response.data && response.data[key] && Array.isArray(response.data[key])) return response.data[key];
    }
    return [];
  };

  const filterBySearchQuery = (items, query, category) => {
    if (!query || !items || items.length === 0) return items;
    const searchLower = query.toLowerCase();

    return items.filter(item => {
      switch (category) {
        case 'events': return (item.title?.toLowerCase().includes(searchLower) || item.type?.toLowerCase().includes(searchLower));
        case 'clients': case 'partners': return (item.name?.toLowerCase().includes(searchLower) || item.company?.toLowerCase().includes(searchLower));
        case 'invoices': return (item.invoiceNumber?.toLowerCase().includes(searchLower) || item.recipientName?.toLowerCase().includes(searchLower));
        case 'payments': return (item.reference?.toLowerCase().includes(searchLower));
        case 'tasks': return (item.title?.toLowerCase().includes(searchLower));
        case 'reminders': return (item.title?.toLowerCase().includes(searchLower));
        default: return false;
      }
    });
  };

  const handleSearchSubmit = () => { if (searchQuery.trim()) { /* Save recent if needed */ } };
  const handleSearchKeyPress = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchSubmit(); } };

  const handleResultClick = (type, id) => {
    setShowSearchResults(false);
    setSearchQuery("");
    const routes = {
      events: `/events/${id}/detail`, clients: `/clients/${id}`, partners: `/partners/${id}`,
      invoices: `/invoices/${id}/edit`, payments: `/payments/${id}`, tasks: `/tasks/${id}`, reminders: `/reminders/${id}`
    };
    navigate(routes[type] || '/');
  };

  // UI Event Handlers (Click Outside & Keyboard)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'Escape') { setShowSearchResults(false); searchInputRef.current?.blur(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- NOTIFICATIONS LOGIC ---
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (!isMounted) return;
      try {
        const response = await reminderService.getUpcoming();
        let reminders = [];
        if (response?.data?.data?.reminders) reminders = response.data.data.reminders;
        else if (response?.data?.reminders) reminders = response.data.reminders;
        else if (Array.isArray(response)) reminders = response;
        
        const activeReminders = reminders.filter(r => r.status === "active");
        if (isMounted) setNotifications(activeReminders);
      } catch (error) { if (isMounted) setNotifications([]); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);
  // --- SOUND EFFECT LOGIC ---
  useEffect(() => {
    if (notifications.length > prevNotificationCount.current) {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Sound autoplay blocked:", e));
        }
    }
    prevNotificationCount.current = notifications.length;
  }, [notifications.length]);


  // Formatting Helpers
  const formatReminderDate = (dateString, timeString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return `${t("notifications.today")} ${timeString || ""}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${timeString || ""}`;
  };

  const getPriorityColor = (priority) => {
    const colors = { urgent: "text-red-600", high: "text-orange-600", medium: "text-yellow-600", low: "text-blue-600" };
    return colors[priority?.toLowerCase()] || "text-gray-600"; // Added toLowerCase safety
  };

  const getUserInitials = () => user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "AV";

  // Results & Config
  const totalResults = Object.values(searchResults).reduce((acc, arr) => acc + arr.length, 0);
  const hasResults = totalResults > 0;
  const categoryConfig = {
    events: { icon: Calendar, color: 'blue', label: t('common.events') },
    clients: { icon: Users, color: 'green', label: t('common.clients') },
    partners: { icon: Briefcase, color: 'purple', label: t('common.partners') },
    invoices: { icon: FileText, color: 'orange', label: t('common.invoices') },
    payments: { icon: DollarSign, color: 'emerald', label: t('common.payments') },
    tasks: { icon: CheckSquare, color: 'indigo', label: t('common.tasks') },
    reminders: { icon: Bell, color: 'yellow', label: t('common.reminders') }
  };

  return (
    <header className={`fixed top-0 ${isRTL ? 'left-0 right-0' : 'left-0 right-0'} h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/80 z-50 transition-all duration-300 ${topBarOffset} dark:bg-gray-900/90 dark:border-gray-700`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-2">
          <button onClick={onMenuClick} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={onToggleCollapse} className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MenuIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <Link to="/home" className="flex items-center justify-center w-9 h-9 rounded-lg transition-transform duration-200 hover:scale-110 ml-1 text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800">
            <LayoutGrid className="h-5 w-5" />
          </Link>
          
          <Link to="/" className="flex items-center gap-2 lg:hidden ml-2">
            <div className="relative h-12 w-auto">
              <img src="/fiesta logo-01.png" alt="Fiesta Logo" className="h-full w-auto object-contain" onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          </Link>
        </div>

        {/* CENTER SECTION - SEARCH */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
          <div className={`relative w-full transition-transform duration-300 ${showSearchResults ? 'scale-[1.02]' : 'scale-100'}`}>
            <button onClick={handleSearchSubmit} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 p-1 hover:text-blue-500 transition-colors z-10`}>
              {searchLoading ? <Loader2 className="w-4 h-4 text-orange-500 animate-spin" /> : <Search className="w-4 h-4 text-gray-400" />}
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("common.searchPlaceholder", "Search events, clients...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              onFocus={() => { if (searchQuery.trim().length >= 2) setShowSearchResults(true); }}
              className={`search-glow w-full ${isRTL ? 'pr-10 pl-24' : 'pl-10 pr-24'} py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showSearchResults && (
            <div className={`animate-dropdown absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[600px] overflow-y-auto`}>
               {searchLoading ? (
                 <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></div>
               ) : (
                 <div className="py-2">
                   {hasResults && <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Found {totalResults} results</p>
                   </div>}
                   
                   {hasResults ? Object.entries(searchResults).map(([category, items]) => {
                     if (items.length === 0) return null;
                     const config = categoryConfig[category];
                     const Icon = config.icon;
                     return (
                       <div key={category} className="py-2">
                          <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                             <Icon size={12}/> {config.label}
                          </div>
                          {items.map(item => (
                             <button key={item._id} onClick={() => handleResultClick(category, item._id)} className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between group">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.title || item.name || item.invoiceNumber}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                             </button>
                          ))}
                       </div>
                     );
                   }) : <div className="p-8 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          
          <button onClick={toggleTheme} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden w-9 h-9">
             <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
               <SunIcon className="h-5 w-5 text-orange-500" />
             </div>
             <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
               <MoonIcon className="h-5 w-5 text-blue-300" />
             </div>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
              <div className={notifications.length > 0 ? "animate-swing origin-top" : "group-hover:scale-110 transition-transform"}>
                 <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              
              {notifications.length > 0 && (
                 <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                 </span>
              )}
            </button>
            
            {notificationDropdownOpen && (
              <div className={`animate-dropdown absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("notifications.upcomingReminders")}</h3>
                  {notifications.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{notifications.length}</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((reminder) => (
                    <div key={reminder._id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700" onClick={() => { navigate("/reminders"); setNotificationDropdownOpen(false); }}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{reminder.title}</p>
                          <span className={`text-[10px] ${getPriorityColor(reminder.priority)} uppercase font-bold tracking-wider`}>{reminder.priority}</span>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">{formatReminderDate(reminder.reminderDate, reminder.reminderTime)}</span>
                      </div>
                    </div>
                  )) : <div className="px-4 py-8 text-center text-sm text-gray-500">{t("notifications.noReminders")}</div>}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className={`flex items-center gap-3 ${isRTL ? 'pr-3 pl-2' : 'pl-3 pr-2'} py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group`}>
              <div className={`hidden sm:block ${isRTL ? 'text-left' : 'text-right'}`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{user?.name || t("common.user")}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role?.name || user?.role || "Staff"}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-orange-200 transition-all group-hover:scale-105">
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block group-hover:text-orange-500 transition-colors" />
            </button>
            {dropdownOpen && (
              <div className={`animate-dropdown absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 z-50`} dir={isRTL ? 'rtl' : 'ltr'}>
                <button className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => { navigate("/settings"); setDropdownOpen(false); }}>
                  <Settings className="w-4 h-4" /> {t("common.settings")}
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                  <button className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2" onClick={() => { logout(); setDropdownOpen(false); }}>
                    <LogOut className="w-4 h-4" /> {t("common.logout")}
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