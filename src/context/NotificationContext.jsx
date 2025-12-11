import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { reminderService } from "../api/index"; // Adjust path to your api
import { useAuth } from "./AuthContext"; // Import Auth to ensure we only fetch when logged in

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth(); // Get auth state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refs to prevent overlapping fetches
  const isFetching = useRef(false);
  const mounted = useRef(true);

  // --- 1. STABLE FETCH FUNCTION ---
  const fetchNotifications = useCallback(async () => {
    // Stop if not logged in or already fetching
    if (!user || isFetching.current) return;

    try {
      isFetching.current = true;
      const response = await reminderService.getUpcoming({ hours: 168 });
      
      // Defensive parsing to prevent "map is not a function"
      const payload = response.data;
      let list = [];
      
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data?.reminders)) list = payload.data.reminders;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.reminders)) list = payload.reminders;

      if (mounted.current) {
        setNotifications(list);
        setLoading(false);
      }
    } catch (err) {
      console.error("Context Fetch Error:", err);
    } finally {
      isFetching.current = false;
    }
  }, [user]);

  // --- 2. POLLING SETUP ---
  useEffect(() => {
    mounted.current = true;

    // Only start polling if user exists
    if (user) {
      fetchNotifications();
      
      // Poll every 60 seconds
      const intervalId = setInterval(fetchNotifications, 60000);
      
      return () => {
        clearInterval(intervalId);
      };
    }

    return () => { 
      mounted.current = false; 
    };
  }, [user, fetchNotifications]);

  // --- 3. ACTIONS ---
  const markAsComplete = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id)); // Optimistic UI
    try { await reminderService.toggleComplete(id); } catch { fetchNotifications(); }
  };

  const dismissNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try { await reminderService.dismiss(id); } catch { fetchNotifications(); }
  };

  // --- 4. DATA PROCESSING ---
  const categorized = {
    overdue: notifications.filter(n => new Date(n.reminderDate) < new Date()),
    critical: notifications.filter(n => {
       // Logic for critical/urgent
       const hours = (new Date(n.reminderDate) - new Date()) / 36e5;
       return hours > 0 && hours <= 24;
    }),
    today: notifications // Add specific filter logic if needed
  };

  const alertCount = categorized.overdue.length + categorized.critical.length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      categorized,
      alertCount,
      loading,
      markAsComplete,
      dismissNotification,
      refresh: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom Hook
export const useNotifications = () => useContext(NotificationContext);