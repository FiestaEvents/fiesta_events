// ============================================
// USER SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const userService = {
  /**
   * Get all users with optional filters
   * @param {Object} params - { search, role, status, page, limit }
   * @returns {Promise<{ users: Array, pagination }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/users", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single user by ID
   * @param {string} id - User ID
   * @returns {Promise<{ user }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new user
   * @param {Object} data - User data
   * @returns {Promise<{ user }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/users", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ user }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user status (active/inactive)
   * @param {string} id - User ID
   * @param {string} status - New status
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/users/${id}/status`, { status });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user role
   * @param {string} id - User ID
   * @param {string} roleId - New role ID
   */
  updateRole: async (id, roleId) => {
    try {
      const response = await api.patch(`/users/${id}/role`, { roleId });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get user statistics
   * @returns {Promise<{ total, active, inactive, byRole }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/users/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get user activity logs
   * @param {string} id - User ID
   * @param {Object} params - { page, limit, startDate, endDate }
   * @returns {Promise<{ activities: Array, pagination }>}
   */
  getActivities: async (id, params = {}) => {
    try {
      const response = await api.get(`/users/${id}/activities`, { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search users by name, email, or other criteria
   * @param {string} query - Search term
   * @param {Object} params - Additional search parameters
   * @returns {Promise<{ users: Array }>}
   */
  search: async (query, params = {}) => {
    try {
      const response = await api.get("/users/search", {
        params: { q: query, ...params },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk update users (for role changes, status updates, etc.)
   * @param {Array} userIds - Array of user IDs
   * @param {Object} data - Fields to update for all users
   */
  bulkUpdate: async (userIds, data) => {
    try {
      const response = await api.patch("/users/bulk-update", { userIds, data });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get users by role
   * @param {string} role - Role to filter by
   * @returns {Promise<{ users: Array }>}
   */
  getByRole: async (role) => {
    try {
      const response = await api.get("/users", { params: { role } });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get current user's profile (alias for authService.getMe)
   * @returns {Promise<{ user }>}
   */
  getProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload user profile picture
   * @param {string} id - User ID
   * @param {File} file - Image file
   */
  uploadAvatar: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post(`/users/${id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Remove user profile picture
   * @param {string} id - User ID
   */
  removeAvatar: async (id) => {
    try {
      const response = await api.delete(`/users/${id}/avatar`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};