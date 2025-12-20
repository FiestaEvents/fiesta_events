import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { reminderService } from "../api/index"; 
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  // Play sound safely
  const playAlertSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/medium.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => console.log("Audio play blocked, requires user interaction"));
    } catch (e) {
      console.warn("Sound error", e);
    }
  }, []);

  // Fetch initial reminders
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await reminderService.getUpcoming({ hours: 720 });
      let list = [];
      const payload = response.data;

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

  // Socket setup
  useEffect(() => {
    mounted.current = true;
    if (!user) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Initial fetch
    fetchNotifications();

    // Create socket after user is ready
    const socket = io(SOCKET_URL, { autoConnect: true, withCredentials: true });
    const roomId = user.venueId || user._id;

    socket.emit("join_room", roomId);

    socket.on("reminder_alert", (newReminder) => {
      console.log("🔔 New Reminder:", newReminder);

      playAlertSound();

      // Update state immediately
      setNotifications((prev) => {
        if (prev.find(n => n._id === newReminder._id)) return prev;
        return [newReminder, ...prev];
      });

      // Desktop notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(newReminder.title, {
          body: newReminder.description || "You have a new reminder!",
          icon: "/fiesta logo-01.png"
        });
      }
    });

    return () => {
      mounted.current = false;
      socket.disconnect();
    };
  }, [user, fetchNotifications, playAlertSound]);

  // Actions
  const markAsComplete = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try { await reminderService.toggleComplete(id); } catch { fetchNotifications(); }
  };

  const dismissNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try { await reminderService.dismiss(id); } catch { fetchNotifications(); }
  };

  // Categorize reminders
  const categorized = {
    overdue: notifications.filter(n => new Date(n.reminderDate) < new Date()),
    critical: notifications.filter(n => {
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
