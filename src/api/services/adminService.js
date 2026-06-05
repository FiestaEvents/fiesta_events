import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const adminService = {
  // Stats
  getDashboardStats: async () => {
    try {
      // Assuming you create a stats endpoint in backend, or we aggregate manually
      const response = await api.get("/admin/stats"); 
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Business Management
  getBusinesses: async (params) => {
    try {
      const response = await api.get("/admin/businesses", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateSubscription: async (id, data) => {
    try {
      const response = await api.patch(`/admin/business/${id}/subscription`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // User Management
  getAllUsers: async (params) => {
    try {
      const response = await api.get("/admin/users", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  manageUser: async (id, data) => {
    try {
      const response = await api.patch(`/admin/users/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};