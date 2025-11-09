import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/index";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const userData = authService.getUser();
          console.log("🔐 Loaded user from localStorage:", userData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    console.log("✅ Login response:", response);

    // Make sure user is set from the response
    if (response.user) {
      setUser(response.user);
    }

    return response;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    console.log("✅ Register response:", response);

    // Make sure user is set from the response
    if (response.user) {
      setUser(response.user);
    }

    navi;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  // Debug log
  console.log("🔍 Auth State:", {
    user: !!user,
    loading,
    isAuthenticated: !!user,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
