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
      if (userData.token) localStorage.setItem("token", userData.token);
    } else {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("venueId");
      localStorage.removeItem("token");
    }
  }, []);

  //  NEW: Silent Refresh (Updates permissions without logout)
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe();
      const userData = response.data?.user || response.user || response.data;
      if (userData) {
        console.log("🔄 [Auth] Profile & Permissions Refreshed");
        updateUser(userData); // Updates Context -> Re-renders Sidebar/Guards
      }
    } catch (error) {
      // Only logout on 401 (invalid token), not on network errors
      if (error.status === 401) {
        console.warn("Session expired (401):", error.message);
        updateUser(null);
      } else {
        console.warn("Silent refresh failed (non-401):", error.message);
        // Don't force logout on network errors or other issues
      }
    }
  }, [updateUser]);

  // 1. Initial Session Check (On Mount)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get stored token to send with the request
        const storedToken = localStorage.getItem('token');
        
        // If no token, clear stored user data
        if (!storedToken) {
          localStorage.removeItem("user");
          setLoading(false);
          return;
        }

        const response = await authService.getMe();
        const validUser = response.data?.user || response.user || response.data;
        if (validUser) {
          // Keep the stored token when updating user
          const userWithToken = { ...validUser, token: storedToken };
          setUser(userWithToken);
          localStorage.setItem("user", JSON.stringify(userWithToken));
        } else {
          throw new Error("No user data");
        }
      } catch (error) {
        // Only clear auth on 401, not on network errors
        if (error.status === 401) {
          console.warn("Invalid or expired token:", error.message);
          updateUser(null);
        } else {
          console.warn("Initial auth check failed (non-401):", error.message);
          // Keep existing user in localStorage if network error during init
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              updateUser(null);
            }
          } else {
            updateUser(null);
          }
        }
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
    const token = response.data?.token || response.token;
    if (userData) {
      // Store token with user data if it exists
      const userWithToken = { ...userData, ...(token && { token }) };
      updateUser(userWithToken);
    }
    return response;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    const userData = response.data?.user || response.user || response.data;
    const token = response.data?.token || response.token;
    if (userData) {
      // Store token with user data if it exists
      const userWithToken = { ...userData, ...(token && { token }) };
      updateUser(userWithToken);
    }
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
