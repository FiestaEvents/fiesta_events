import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../api/index";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync state & localStorage
  const updateUser = useCallback((userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.venueId) localStorage.setItem("venueId", userData.venueId);
    } else {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("venueId");
    }
  }, []);

  // ✅ NEW: Silent Refresh (Updates permissions without logout)
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      const userData = response.data?.user || response.user || response.data;
      if (userData) {
        console.log("🔄 [Auth] Profile & Permissions Refreshed");
        updateUser(userData); // Updates Context -> Re-renders Sidebar/Guards
      }
    } catch (error) {
      console.warn("Silent refresh failed:", error.message);
      // Don't force logout on simple network error during refresh
    }
  }, [updateUser]);

  // 1. Initial Session Check (On Mount)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getMe();
        const validUser = response.data?.user || response.user || response.data;
        if (validUser) {
          updateUser(validUser);
        } else {
          throw new Error("No user data");
        }
      } catch (error) {
        updateUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [updateUser]);

  // 2. 🔒 GLOBAL EVENT LISTENERS
  useEffect(() => {
    // A. Handle 401 (Logout)
    const handleSessionExpired = () => {
      console.warn("🔒 Session expired. Logging out...");
      updateUser(null);
      // window.location.href = "/login"; // Optional: Force redirect
    };

    // B. Handle Updates (Profile Save, Role Change, Window Focus)
    const handleRefresh = () => refreshUser();

    // Listeners
    window.addEventListener("auth:session-expired", handleSessionExpired); // From Axios
    window.addEventListener("auth:refresh-profile", handleRefresh); // From Axios (403)
    window.addEventListener("profileUpdated", handleRefresh); // From Frontend Actions
    window.addEventListener("focus", handleRefresh); // When tab becomes active

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
      window.removeEventListener("auth:refresh-profile", handleRefresh);
      window.removeEventListener("profileUpdated", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [updateUser, refreshUser]);

  // 3. Sync Logout Across Tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" && e.newValue === null) {
        setUser(null);
        window.location.href = "/login";
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- Actions ---

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const userData = response.data?.user || response.user || response.data;
    if (userData) updateUser(userData);
    return response;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    const userData = response.data?.user || response.user || response.data;
    if (userData) updateUser(userData);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    }
    updateUser(null);
    window.location.href = "/login"; // Hard refresh to clear memory
  };

  const verifyEmail = async (email) => authService.verifyEmail({ email });

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyEmail,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
