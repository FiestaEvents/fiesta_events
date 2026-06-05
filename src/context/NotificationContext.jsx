import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { reminderService } from "../api/services/reminderService"; // Ensure correct path
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const socketRef = useRef(null);

  // Get API URL from env
  const SOCKET_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
    : "http://localhost:5000";

  // Play sound safely
  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/medium.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("Audio play blocked (user interaction required):", e));
    } catch (e) {
      console.warn("Sound error", e);
    }
  }, []);

  // Fetch initial reminders (Upcoming + Overdue)
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch 30 days lookahead
      const response = await reminderService.getUpcoming({ hours: 720 });
      
      let list = [];
      // Handle various response structures
      const payload = response.data || response; 
      
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.reminders)) list = payload.reminders;
      else if (Array.isArray(payload?.data)) list = payload.data;

      if (mounted.current) {
        setNotifications(list);
        setLoading(false);
      }
    } catch (err) {
      console.error("Initial Fetch Error:", err);
    }
  }, [user]);

  // Socket setup
  useEffect(() => {
    mounted.current = true;
    if (!user) return;

    // 1. Determine Business ID for Room
    // Chameleon Architecture: User -> Business -> ID
    const roomId = user.business?.id || user.businessId || user._id;

    if (!roomId) return;

    // 2. Request browser notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // 3. Initial fetch
    fetchNotifications();

    // 4. Initialize Socket
    // Pass token in auth object for the backend middleware we created
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];

    socketRef.current = io(SOCKET_URL, { 
      autoConnect: true, 
      withCredentials: true,
      auth: { token } // Backend expects this in handshake
    });

    // 5. Join Business Room
    socketRef.current.emit("join_room", roomId);

    // 6. Listen for Agenda Alerts
    // Backend emits: "reminder:alert"
    socketRef.current.on("reminder:alert", (newReminder) => {
      
      // Filter: Check if this user is assigned
      const isAssigned = newReminder.assignedTo && newReminder.assignedTo.includes(user.id || user._id);
      
      // If no assignees, assume it's for everyone in business (or Owner)
      const isForEveryone = !newReminder.assignedTo || newReminder.assignedTo.length === 0;

      if (isAssigned || isForEveryone) {
        console.log("🔔 New Real-time Reminder:", newReminder);
        playAlertSound();

        // Update state
        setNotifications((prev) => {
          // Avoid duplicates
          if (prev.find(n => n._id === newReminder.id || n._id === newReminder._id)) return prev;
          
          // Normalize ID from backend payload
          const normalized = { 
            ...newReminder, 
            _id: newReminder.id || newReminder._id,
            reminderDate: new Date().toISOString() // It's happening now
          };
          
          return [normalized, ...prev];
        });

        // Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(newReminder.title, {
            body: newReminder.description || "You have a new reminder!",
            icon: "/fiesta logo-01.png"
          });
        }
      }
    });

    return () => {
      mounted.current = false;
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, fetchNotifications, playAlertSound, SOCKET_URL]);

  // Actions
  const markAsComplete = async (id) => {
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n._id !== id));
    try { 
      await reminderService.toggleComplete(id); 
    } catch (err) { 
      console.error("Failed to complete:", err);
      fetchNotifications(); // Revert on error
    }
  };

  const dismissNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try { 
      await reminderService.dismiss(id); 
    } catch (err) { 
      console.error("Failed to dismiss:", err);
      fetchNotifications(); 
    }
  };

  // Categorize logic
  const categorized = {
    overdue: notifications.filter(n => new Date(n.reminderDate) < new Date() && n.status !== 'completed'),
    critical: notifications.filter(n => {
      if(n.priority === 'urgent') return true;
      const hours = (new Date(n.reminderDate) - new Date()) / 36e5;
      return hours > 0 && hours <= 24;
    }),
    today: notifications,
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

export const useNotifications = () => useContext(NotificationContext);