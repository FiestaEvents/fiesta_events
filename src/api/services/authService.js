// ============================================
// AUTH SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const authService = {
  
  verifyEmail: async (data) => {
    try {
      const response = await api.post("/auth/verify-email", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      // NOTE: Token is set in HttpOnly cookie by backend.
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      // NOTE: Token is set in HttpOnly cookie by backend.
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      // NOTE: Backend clears the cookie. Frontend just redirects.
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Helper methods (Simplified)
  // isAuthenticated: Logic moved to Context/Hook via API check
  getUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  getVenueId: () => localStorage.getItem("venueId"),
};