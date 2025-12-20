import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Monitor 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrbitLoader from "../../common/LoadingSpinner"; 
import { useNotifications } from "../../../context/NotificationContext";

// Notification badge
const NotificationBadge = ({ count }) => {
  if (!count) return null;
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

const NotificationMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { notifications, categorized, alertCount, markAsComplete, dismissNotification, loading } = useNotifications();
  const [preferences, setPreferences] = useState({ sound: true, desktop: true });

  const updatePreferences = (newPrefs) => setPreferences(prev => ({...prev, ...newPrefs}));

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSeverityStyles = (reminder) => {
    const now = new Date();
    const due = new Date(reminder.due || reminder.reminderDate);
    if (due < now) return { bg: "bg-red-50 dark:bg-red-900/20", icon: "text-red-600 dark:text-red-400", border: "ltr:border-l-red-500 rtl:border-r-red-500" };
    if (reminder.urgency === 'imminent') return { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-600 dark:text-orange-400", border: "ltr:border-l-orange-500 rtl:border-r-orange-500" };
    if (reminder.urgency === 'today') return { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-600 dark:text-blue-400", border: "ltr:border-l-blue-500 rtl:border-r-blue-500" };
    return { bg: "bg-white dark:bg-gray-800", icon: "text-gray-500 dark:text-gray-400", border: "ltr:border-l-gray-300 rtl:border-r-gray-600" };
  };

  const getList = () => {
    switch (selectedCategory) {
      case "overdue": return categorized.overdue;
      case "critical": return categorized.critical;
      case "today": return categorized.today;
      default: return notifications;
    }
  };

  const getEmptyMessage = () => {
    switch (selectedCategory) {
      case "overdue": return t("notifications.empty.overdue", "No overdue items. Great job!");
      case "critical": return t("notifications.empty.critical", "No critical alerts at the moment.");
      case "today": return t("notifications.empty.today", "No tasks scheduled for today.");
      default: return t("notifications.empty.all", "You're all caught up! No notifications.");
    }
  };

  const currentList = getList();
  const tabs = [
    { id: "all", label: t("notifications.tabs.all", "All") },
    { id: "overdue", label: t("notifications.tabs.overdue", "Overdue"), count: categorized.overdue.length },
    { id: "critical", label: t("notifications.tabs.critical", "Critical"), count: categorized.critical.length },
  ];

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full transition-all duration-200 ${isOpen ? "bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400" : "hover:bg-gray-100 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"}`}
      >
        <Bell className="w-6 h-6" />
        <NotificationBadge count={alertCount} />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute ltr:right-0 rtl:left-0 mt-3 w-[400px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden ltr:origin-top-right rtl:origin-top-left"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t("notifications.title", "Notifications")}</h3>
              <button onClick={() => { setIsOpen(false); navigate("/reminders"); }} className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline">{t("notifications.viewAll", "View All")}</button>
            </div>

            {/* Tabs */}
            <div className="flex px-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setSelectedCategory(tab.id)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors relative ${selectedCategory === tab.id ? "border-orange-500 text-orange-600 dark:text-orange-400" : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                  {tab.label}
                  {tab.count > 0 && <span className="ms-1.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] text-gray-600 dark:text-gray-300">{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-black/20">
              {loading && currentList.length === 0 ? (
                <div className="flex justify-center items-center py-8"><OrbitLoader /></div>
              ) : currentList.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentList.map((rem) => {
                    const style = getSeverityStyles(rem);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={rem._id}
                        onClick={() => { setIsOpen(false); navigate(`/reminders/${rem._id}`); }}
                        className={`group relative p-4 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer border-l-4 rtl:border-l-0 rtl:border-r-4 ${style.border} ${style.bg}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm ${style.icon}`}><Clock className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate pe-2">{rem.title}</h4>
                              <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">{rem.reminderTime}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{rem.description || t("notifications.noDescription", "No description available")}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase ${style.icon}`}>{new Date(rem.reminderDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="absolute ltr:right-2 rtl:left-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-200">
                          <button onClick={(e) => { e.stopPropagation(); markAsComplete(rem._id); }} className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md shadow-sm" title="Complete"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); dismissNotification(rem._id); }} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md shadow-sm" title="Dismiss"><X className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3"><Bell className="w-8 h-8 text-gray-400" /></div>
                  <p className="text-gray-900 dark:text-white font-medium">{getEmptyMessage()}</p>
                </div>
              )}
            </div>

            {/* Footer Preferences */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-gray-500"><Settings className="w-3 h-3" /><span>{t("notifications.settings.title", "Preferences")}</span></div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); updatePreferences({ sound: !preferences.sound }); }} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${preferences.sound ? "bg-white dark:bg-gray-800 border-green-200 text-green-600 shadow-sm" : "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400"}`}><Volume2 className="w-3 h-3" />{t("notifications.settings.sound", "Sound")}</button>
                <button onClick={(e) => { e.stopPropagation(); updatePreferences({ desktop: !preferences.desktop }); }} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${preferences.desktop ? "bg-white dark:bg-gray-800 border-blue-200 text-blue-600 shadow-sm" : "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400"}`}><Monitor className="w-3 h-3" />{t("notifications.settings.desktop", "Desktop")}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationMenu;
