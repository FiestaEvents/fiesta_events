import { useEffect, useRef, useCallback, useState } from "react";
import { reminderService } from "../../api/index";
import { CheckCircle, Clock, X } from "lucide-react";

// ==========================================
// 1. CONSTANTS
// ==========================================

const NotificationSounds = {
  urgent: "/sounds/urgent.mp3",
  high: "/sounds/high.mp3",
  medium: "/sounds/medium.mp3",
  low: "/sounds/low.mp3",
};
{/*"notification alert"
"warning beep"
"soft chime"
"urgent alarm"

 https://www.zapsplat.com
 */}
const DEFAULT_PREFERENCES = {
  sound: true,
  desktop: true,
  checkInterval: 60000, // 1 minute
};

// ==========================================
// 2. UTILITIES
// ==========================================

const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Browser doesn't support notifications");
    return false;
  }
  
  if (Notification.permission === "granted") return true;
  
  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }
  
  return false;
};

const showDesktopNotification = (title, options = {}) => {
  if (Notification.permission !== "granted") return null;
  
  try {
    const notification = new Notification(title, {
      icon: "/fiesta logo-01.png",
      badge: "/fiesta logo-01.png",
      requireInteraction: false,
      ...options,
    });
    
    notification.onclick = () => {
      window.focus();
      if (options.onClick) options.onClick();
      notification.close();
    };
    
    // Auto-close after 8 seconds
    setTimeout(() => notification.close(), 8000);
    
    return notification;
  } catch (error) {
    console.error("Error showing desktop notification:", error);
    return null;
  }
};

// ✅ Extract reminders from various response patterns
const extractReminders = (response) => {
  // Pattern 1: response.data.data.reminders (most common in your API)
  if (response?.data?.data?.reminders) {
    return Array.isArray(response.data.data.reminders) 
      ? response.data.data.reminders 
      : [];
  }
  
  // Pattern 2: response.data.reminders
  if (response?.data?.reminders) {
    return Array.isArray(response.data.reminders) 
      ? response.data.reminders 
      : [];
  }
  
  // Pattern 3: response.data (direct array)
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  
  // Pattern 4: response (direct array)
  if (Array.isArray(response)) {
    return response;
  }
  
  console.warn("Unexpected reminder response format:", response);
  return [];
};

// ✅ Process single reminder with proper date handling
const processReminder = (reminder, now) => {
  try {
    // Handle date properly
    const dateStr = reminder.reminderDate.includes("T") 
      ? reminder.reminderDate.split("T")[0]
      : reminder.reminderDate;
    
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = (reminder.reminderTime || "00:00").split(":").map(Number);
    
    // Create date in local timezone
    const dueDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    // Calculate time difference
    const diffMs = dueDate - now;
    const diffMinutes = diffMs / (1000 * 60);
    const diffHours = diffMinutes / 60;

    // Filter out reminders outside the relevant window
    if (diffHours < -24 || diffHours > 168) return null;

    // Determine urgency and sound type
    let urgency, soundType;
    
    if (diffHours < 0) {
      urgency = "overdue";
      soundType = "urgent";
    } else if (diffMinutes <= 15) {
      urgency = "imminent";
      soundType = "urgent";
    } else if (diffHours <= 1) {
      urgency = "1h";
      soundType = "high";
    } else if (diffHours <= 4) {
      urgency = "4h";
      soundType = "medium";
    } else if (diffHours <= 24) {
      urgency = "today";
      soundType = "low";
    } else {
      urgency = "future";
      soundType = "low";
    }

    return {
      ...reminder,
      due: dueDate,
      diffHours,
      diffMinutes,
      urgency,
      soundType,
    };
  } catch (error) {
    console.error("Error processing reminder:", reminder, error);
    return null;
  }
};

// ✅ Categorize notifications in single pass
const categorizeNotifications = (notifications) => {
  const categorized = {
    overdue: [],
    critical: [],
    today: [],
    upcoming: [],
  };

  notifications.forEach(n => {
    if (n.diffHours < 0) {
      categorized.overdue.push(n);
    } else if (n.diffHours <= 1) {
      categorized.critical.push(n);
    } else if (n.diffHours <= 24) {
      categorized.today.push(n);
    } else if (n.diffHours <= 168) {
      categorized.upcoming.push(n);
    }
  });

  return categorized;
};

// ==========================================
// 3. ENHANCED NOTIFICATION HOOK
// ==========================================

export const useEnhancedNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [categorized, setCategorized] = useState({
    overdue: [],
    critical: [],
    today: [],
    upcoming: [],
  });
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("notificationPreferences");
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch (e) {
      console.error("Failed to load preferences:", e);
      return DEFAULT_PREFERENCES;
    }
  });

  // Refs
  const audioRefs = useRef({
    urgent: new Audio(NotificationSounds.urgent),
    high: new Audio(NotificationSounds.high),
    medium: new Audio(NotificationSounds.medium),
    low: new Audio(NotificationSounds.low),
  });
  const prevAlertCount = useRef(0);
  const notifiedIds = useRef(new Set());
  const fetchAbortController = useRef(null);
  const isMounted = useRef(true);
  const intervalIdRef = useRef(null);
  const isFetching = useRef(false); // ✅ Flag to prevent overlapping requests

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================
  
  const fetchNotifications = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NOTIFICATIONS] Starting fetch...', new Date().toISOString());
    }
    const startTime = performance.now();
    
    try {
      // Cancel previous fetch if still running
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
      
      fetchAbortController.current = new AbortController();
      
      // Fetch reminders
      const response = await reminderService.getUpcoming({
        hours: 168, // 7 days
        signal: fetchAbortController.current.signal
      });
      
      const fetchDuration = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NOTIFICATIONS] Fetch completed in ${fetchDuration.toFixed(0)}ms`);
      }
      
      // Handle aborted requests
      if (response?.aborted) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[NOTIFICATIONS] Fetch aborted');
        }
        return;
      }
      
      // Extract and validate reminders
      const remindersList = extractReminders(response);
      
      if (!Array.isArray(remindersList)) {
        console.error("[NOTIFICATIONS] Invalid reminders data:", response);
        setError("Invalid data received from server");
        setLoading(false);
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NOTIFICATIONS] Processing ${remindersList.length} reminders...`);
      }      
      // Process reminders
      const now = new Date();
      const processed = remindersList
        .map(r => processReminder(r, now))
        .filter(Boolean); // Remove null entries
      
      // Update state only if component is still mounted
      if (!isMounted.current) return;
      
      setNotifications(processed);
      
      // Categorize
      const cats = categorizeNotifications(processed);
      setCategorized(cats);
      
      // Calculate alert count (overdue + critical)
      const count = cats.overdue.length + cats.critical.length;
      setAlertCount(count);
      
      const totalDuration = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NOTIFICATIONS] Complete! Processed ${processed.length} reminders, ${count} alerts. Total time: ${totalDuration.toFixed(0)}ms`);
      }
      
      // Show desktop notifications for new critical reminders
      // ✅ Access preferences directly from state, not from closure
      const currentPrefs = JSON.parse(localStorage.getItem("notificationPreferences") || "{}");
      if (currentPrefs.desktop && count > prevAlertCount.current) {
        const newCritical = [...cats.overdue, ...cats.critical]
          .filter(r => !notifiedIds.current.has(r._id))
          .slice(0, 3); // Limit to 3 notifications
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[NOTIFICATIONS] Showing ${newCritical.length} desktop notifications`);
        }        
        newCritical.forEach(reminder => {
          showDesktopNotification(
            reminder.title,
            {
              body: `${reminder.urgency === 'overdue' ? '⚠️ OVERDUE' : '🔔'} ${reminder.description || ''}`,
              tag: reminder._id, // Prevent duplicates
            }
          );
          notifiedIds.current.add(reminder._id);
        });
      }
      
      setError(null);
      setLoading(false);
      
    } catch (err) {
      const fetchDuration = performance.now() - startTime;
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error(`[NOTIFICATIONS] Fetch error after ${fetchDuration.toFixed(0)}ms:`, err);
        if (isMounted.current) {
          setError(err.message || "Failed to fetch notifications");
          setLoading(false);
        }
      }
    }
  }, []); // ✅ No dependencies - stable reference

  // ==========================================
  // SOUND EFFECTS
  // ==========================================
  
  useEffect(() => {
    if (!preferences.sound || alertCount === 0) return;
    
    // Play sound only if alert count increased
    if (alertCount > prevAlertCount.current) {
      requestAnimationFrame(() => {
        const mostUrgent = notifications.find(n => 
          n.urgency === "overdue" || n.urgency === "imminent"
        );
        
        const soundType = mostUrgent?.soundType || "medium";
        const audio = audioRefs.current[soundType];
        
        if (audio) {
          audio.volume = 0.5; // 50% volume
          audio.play().catch(e => 
            console.log("Audio playback blocked by browser:", e)
          );
        }
      });
    }
    
    prevAlertCount.current = alertCount;
  }, [alertCount, notifications, preferences.sound]);

  // ==========================================
  // POLLING INTERVAL - IMMEDIATE FETCH ON MOUNT
  // ==========================================
  
  useEffect(() => {
    isMounted.current = true;
    if (process.env.NODE_ENV === 'development') {
      console.log('[NOTIFICATIONS] Hook mounted, setting up polling...');
    }
    
    // ✅ Fetch immediately on mount
    fetchNotifications();

    // ✅ Set up polling interval
    intervalIdRef.current = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NOTIFICATIONS] Interval tick');
      }
      fetchNotifications();
    }, preferences.checkInterval);

    // Cleanup
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NOTIFICATIONS] Cleaning up...');
      }
      isMounted.current = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Run once on mount only

  // ==========================================
  // REQUEST DESKTOP PERMISSION
  // ==========================================
  
  useEffect(() => {
    if (preferences.desktop) {
      requestNotificationPermission();
    }
  }, [preferences.desktop]);

  // ==========================================
  // ACTIONS
  // ==========================================
  
  const snoozeNotification = useCallback(async (id, minutes = 15) => {
    try {
      await reminderService.snooze(id, minutes);
      // Refetch to get updated data
      await fetchNotifications();
      return { success: true };
    } catch (error) {
      console.error("Snooze error:", error);
      return { success: false, error: error.message };
    }
  }, [fetchNotifications]);

  const dismissNotification = useCallback(async (id) => {
    try {
      await reminderService.dismiss(id);
      // Update local state immediately for better UX
      setNotifications(prev => prev.filter(n => n._id !== id));
      notifiedIds.current.delete(id);
      return { success: true };
    } catch (error) {
      console.error("Dismiss error:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const markAsComplete = useCallback(async (id) => {
    try {
      await reminderService.toggleComplete(id);
      // Refetch to get updated data
      await fetchNotifications();
      return { success: true };
    } catch (error) {
      console.error("Complete error:", error);
      return { success: false, error: error.message };
    }
  }, [fetchNotifications]);

  const updatePreferences = useCallback((newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem("notificationPreferences", JSON.stringify(updated));
    
    // ✅ If checkInterval changed, restart the interval
    if (newPrefs.checkInterval && newPrefs.checkInterval !== preferences.checkInterval) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      
      intervalIdRef.current = setInterval(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[NOTIFICATIONS] Interval fetch triggered');
        }
        fetchNotifications();
      }, updated.checkInterval);
    }
  }, [preferences, fetchNotifications]);

  return {
    notifications,
    categorized,
    alertCount,
    loading,
    error,
    preferences,
    updatePreferences,
    snoozeNotification,
    dismissNotification,
    markAsComplete,
    refresh: fetchNotifications,
  };
};

// ==========================================
// 4. NOTIFICATION ITEM COMPONENT
// ==========================================

export const EnhancedNotificationItem = ({ 
  reminder, 
  onClick, 
  onSnooze, 
  onDismiss, 
  onComplete 
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const getTimeLeft = () => {
    const absHours = Math.abs(reminder.diffHours);
    const h = Math.floor(absHours);
    const m = Math.floor((absHours - h) * 60);

    if (reminder.urgency === "overdue") {
      if (absHours < 1) {
        return `${Math.abs(Math.floor(reminder.diffMinutes))}m ago`;
      }
      return `${h}h ${m}m ago`;
    }
    
    if (reminder.diffHours < 1) {
      return `In ${Math.floor(reminder.diffMinutes)}m`;
    }
    
    if (reminder.diffHours < 24) {
      return `In ${h}h ${m}m`;
    }
    
    return new Date(reminder.due).toLocaleDateString("en-GB", { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getColors = () => {
    const colors = {
      overdue: "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-900 dark:text-red-100",
      imminent: "bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 text-orange-900 dark:text-orange-100",
      "1h": "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-900 dark:text-yellow-100",
      "4h": "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-900 dark:text-blue-100",
      today: "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 text-purple-900 dark:text-purple-100",
      future: "bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
    };
    return colors[reminder.urgency] || colors.future;
  };

  const getUrgencyLabel = () => {
    const labels = {
      overdue: "OVERDUE",
      imminent: "NOW",
      "1h": "1H",
      "4h": "4H",
      today: "TODAY",
      future: "",
    };
    return labels[reminder.urgency] || "";
  };

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-all cursor-pointer ${getColors()}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold leading-tight truncate">
              {reminder.title}
            </p>
            {getUrgencyLabel() && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded flex-shrink-0">
                {getUrgencyLabel()}
              </span>
            )}
          </div>
          <p className="text-xs opacity-80 font-medium">
            {getTimeLeft()}
          </p>
        </div>

        {showActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(reminder._id);
              }}
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
              title="Mark as Complete"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSnooze(reminder._id, 15);
              }}
              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              title="Snooze 15 min"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(reminder._id);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};