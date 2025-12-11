import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client"; // Import Socket.io
import { reminderService } from "../api/index"; 
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

// Initialize Socket connection
// Adjust URL if your backend runs on a different port/domain
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const socket = io(SOCKET_URL, {
  autoConnect: false, 
  withCredentials: true,
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const mounted = useRef(true);

  // Sound Effect
  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/urgent.mp3"); // Ensure this file exists in public/sounds/
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked (interaction needed)"));
    } catch (e) {
      console.warn("Sound error", e);
    }
  }, []);

  // --- 1. INITIAL FETCH (Get existing data once) ---
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch upcoming for the next 7 days (168 hours) to populate the list initially
      const response = await reminderService.getUpcoming({ hours: 168 });
      
      const payload = response.data;
      let list = [];
      
      // Defensive parsing
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data?.reminders)) list = payload.data.reminders;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.reminders)) list = payload.reminders;

      if (mounted.current) {
        setNotifications(list);
        setLoading(false);
      }
    } catch (err) {
      console.error("Initial Fetch Error:", err);
    }
  }, [user]);

  // --- 2. SOCKET SETUP (Replaces setInterval) ---
  useEffect(() => {
    mounted.current = true;

    if (user) {
      // A. Load initial data
      fetchNotifications();

      // B. Connect Socket
      socket.connect();

      // C. Join Room (Identify this client to the server)
      // Assuming your backend emits to 'venueId' or 'userId'
      const roomId = user.venueId || user._id; 
      socket.emit("join_room", roomId);
      console.log(`🔌 Socket connecting to room: ${roomId}`);

      // D. Listen for Cron Job Events
      // The backend Cron should emit this event when it finds a due reminder
      socket.on("reminder_alert", (newReminder) => {
        console.log("🔔 CRON Alert Received:", newReminder);
        
        playAlertSound();

        // Add to state immediately (Real-time update)
        setNotifications((prev) => {
          // Prevent duplicates
          const exists = prev.find(n => n._id === newReminder._id);
          if (exists) return prev;
          return [newReminder, ...prev];
        });

        // Optional: Trigger Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(newReminder.title, { body: newReminder.description });
        }
      });
    }

    // Cleanup on logout/unmount
    return () => {
      mounted.current = false;
      socket.off("reminder_alert");
      socket.disconnect();
    };
  }, [user, fetchNotifications, playAlertSound]);

  // --- 3. ACTIONS ---
  const markAsComplete = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
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
       const hours = (new Date(n.reminderDate) - new Date()) / 36e5;
       return hours > 0 && hours <= 24;
    }),
    today: notifications 
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