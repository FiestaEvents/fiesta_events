//fiesta_events/src/api/index.js
/**
 * ============================================
 * FIESTA VENUE MANAGEMENT - CONSOLIDATED API SERVICES
 * ============================================
 * *
 */

import api from "./axios";

// ============================================
// RESPONSE HANDLER UTILITY
// ============================================
// Normalizes API responses to consistent structure
const handleResponse = (response) => {
  return response.data?.data || response.data;
};

const handleError = (error) => {
  throw error;
};
// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  /**
   * Register new user and venue
   * @param {Object} data - { email, password, venueName, ... }
   * @returns {Promise<{ user, token, venue }>}
   */
  verifyEmail: async (data) => {
    try {
      const response = await api.post("/auth/verify-email", data);
      const result = handleResponse(response);
      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Register new user and venue
   * @param {Object} data - { email, password, venueName, ... }
   * @returns {Promise<{ user, token, venue }>}
   */
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      const result = handleResponse(response);

      // Store auth data
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        if (result.user?.venue?.id) {
          localStorage.setItem("venueId", result.user.venue.id);
        }
      }

      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user, token }>}
   */
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const result = handleResponse(response);

      // Store auth data
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        if (result.user?.venue?.id) {
          localStorage.setItem("venueId", result.user.venue.id);
        }
      }

      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("venueId");
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<{ user }>}
   */
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      const result = handleResponse(response);

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update user profile
   * @param {Object} data - Profile fields to update
   * @returns {Promise<{ user }>}
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      const result = handleResponse(response);

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
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

  /**
   * Request password reset
   * @param {string} email
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   */
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

  // Helper methods
  isAuthenticated: () => !!localStorage.getItem("token"),
  getToken: () => localStorage.getItem("token"),
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

// ============================================
// EVENT SERVICE
// ============================================
export const eventService = {
  /**
   * Get all events with optional filters
   * @param {Object} params - { status, startDate, endDate, clientId, page, limit }
   * @returns {Promise<{ events: Array, pagination }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/events", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single event by ID
   * @param {string} id - Event ID
   * @returns {Promise<{ event }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new event
   * @param {Object} data - Event data
   * @returns {Promise<{ event }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/events", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update event
   * @param {string} id - Event ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ event }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/events/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete event
   * @param {string} id - Event ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update event status
   * @param {string} id - Event ID
   * @param {string} status - New status (pending, confirmed, completed, cancelled)
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/events/${id}/status`, { status });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get calendar view of events
   * @param {Object} params - { month, year }
   * @returns {Promise<{ events: Array }>}
   */
  getCalendar: async (params = {}) => {
    try {
      const response = await api.get("/events/calendar", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get event statistics
   * @returns {Promise<{ total, confirmed, pending, completed, cancelled }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/events/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// CLIENT SERVICE
// ============================================
export const clientService = {
  /**
   * Get all clients with optional filters
   * @param {Object} params - { search, status, page, limit }
   * @returns {Promise<{ clients: Array, pagination }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/clients", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single client by ID
   * @param {string} id - Client ID
   * @returns {Promise<{ client }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new client
   * @param {Object} data - Client data
   * @returns {Promise<{ client }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/clients", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update client
   * @param {string} id - Client ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ client }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/clients/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete client
   * @param {string} id - Client ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get client events
   * @param {string} id - Client ID
   * @returns {Promise<{ events: Array }>}
   */
  getEvents: async (id) => {
    try {
      const response = await api.get(`/clients/${id}/events`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get client statistics
   * @returns {Promise<{ total, active, inactive }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/clients/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// PARTNER SERVICE
// ============================================
export const partnerService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/partners", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/partners/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/partners", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/partners/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/partners/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getEvents: async (id) => {
    try {
      const response = await api.get(`/partners/${id}/events`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/partners/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// PAYMENT SERVICE
// ============================================
export const paymentService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/payments", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/payments", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/payments/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  refund: async (id, data) => {
    try {
      const response = await api.post(`/payments/${id}/refund`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/payments/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// FINANCE SERVICE
// ============================================
export const financeService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/finance", { params });
      // Backend returns: { records, pagination }
      return {
        finance: response.data?.data?.records || [],
        pagination: response.data?.data?.pagination || {},
      };
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/finance/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/finance", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/finance/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/finance/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getSummary: async (params = {}) => {
    try {
      const response = await api.get("/finance/summary", { params });
      // Backend returns: { summary, categoryBreakdown, timeSeries, topExpenses, topIncome }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getCashflow: async (params = {}) => {
    try {
      const response = await api.get("/finance/cashflow", { params });
      // Backend returns: { cashFlow: array, currentBalance }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getExpensesBreakdown: async (params = {}) => {
    try {
      const response = await api.get("/finance/expenses/breakdown", { params });
      // Backend returns: { breakdown, totalExpenses }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getIncomeBreakdown: async (params = {}) => {
    try {
      const response = await api.get("/finance/income/breakdown", { params });
      // Backend returns: { breakdown, totalIncome }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getProfitLoss: async (params = {}) => {
    try {
      const response = await api.get("/finance/profit-loss", { params });
      // Backend returns: { revenue, expenses, profitability }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getTrends: async (params = {}) => {
    try {
      const response = await api.get("/finance/trends", { params });
      // Backend returns: { trends: array }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getTaxSummary: async (params = {}) => {
    try {
      const response = await api.get("/finance/tax-summary", { params });
      // Backend returns: { year, totalIncome, totalExpense, taxableIncome, totalTaxPaid, taxRecords }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// TASK SERVICE
// ============================================
export const taskService = {
  /**
   * Get all tasks with advanced filtering and pagination
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ tasks: Array, pagination: Object, stats: Object }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/tasks", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single task by ID with full details
   * @param {string} id - Task ID
   * @param {boolean} trackView - Whether to track this as a view
   * @returns {Promise<{ task: Object }>}
   */
  getById: async (id, trackView = true) => {
    try {
      const response = await api.get(`/tasks/${id}`, {
        params: { trackView },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new task
   * @param {Object} data - Task data
   * @returns {Promise<{ task: Object }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/tasks", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update task
   * @param {string} id - Task ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ task: Object }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Partially update task (PATCH)
   * @param {string} id - Task ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ task: Object }>}
   */
  patch: async (id, data) => {
    try {
      const response = await api.patch(`/tasks/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete task
   * @param {string} id - Task ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk delete tasks
   * @param {Array<string>} ids - Array of task IDs
   * @returns {Promise<{ success: boolean, deleted: number }>}
   */
  bulkDelete: async (ids) => {
    try {
      const response = await api.post("/tasks/bulk-delete", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // STATUS MANAGEMENT
  // ============================================

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - New status
   * @param {Object} metadata - Additional data (e.g., reason for blocking/cancellation)
   * @returns {Promise<{ task: Object }>}
   */
  updateStatus: async (id, status, metadata = {}) => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, {
        status,
        ...metadata,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Complete a task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  complete: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/complete`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cancel a task
   * @param {string} id - Task ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<{ task: Object }>}
   */
  cancel: async (id, reason) => {
    try {
      const response = await api.post(`/tasks/${id}/cancel`, { reason });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Block a task
   * @param {string} id - Task ID
   * @param {string} reason - Reason for blocking
   * @returns {Promise<{ task: Object }>}
   */
  block: async (id, reason) => {
    try {
      const response = await api.post(`/tasks/${id}/block`, { reason });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Unblock a task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  unblock: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/unblock`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ASSIGNMENT & COLLABORATION
  // ============================================

  /**
   * Assign task to a user
   * @param {string} id - Task ID
   * @param {string} userId - User ID to assign to
   * @returns {Promise<{ task: Object }>}
   */
  assign: async (id, userId) => {
    try {
      const response = await api.patch(`/tasks/${id}/assign`, { userId });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Unassign task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  unassign: async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/unassign`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Add watcher to task
   * @param {string} id - Task ID
   * @param {string} userId - User ID to add as watcher
   * @returns {Promise<{ task: Object }>}
   */
  addWatcher: async (id, userId) => {
    try {
      const response = await api.post(`/tasks/${id}/watchers`, { userId });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Remove watcher from task
   * @param {string} id - Task ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<{ task: Object }>}
   */
  removeWatcher: async (id, userId) => {
    try {
      const response = await api.delete(`/tasks/${id}/watchers/${userId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // COMMENTS
  // ============================================

  /**
   * Add comment to task
   * @param {string} id - Task ID
   * @param {string} text - Comment text
   * @param {Array<string>} mentions - Array of user IDs mentioned
   * @returns {Promise<{ task: Object, comment: Object }>}
   */
  addComment: async (id, text, mentions = []) => {
    try {
      const response = await api.post(`/tasks/${id}/comments`, {
        text,
        mentions,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Edit comment
   * @param {string} id - Task ID
   * @param {string} commentId - Comment ID
   * @param {string} text - Updated comment text
   * @returns {Promise<{ task: Object }>}
   */
  editComment: async (id, commentId, text) => {
    try {
      const response = await api.put(`/tasks/${id}/comments/${commentId}`, {
        text,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete comment
   * @param {string} id - Task ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<{ task: Object }>}
   */
  deleteComment: async (id, commentId) => {
    try {
      const response = await api.delete(`/tasks/${id}/comments/${commentId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // SUBTASKS
  // ============================================

  /**
   * Add subtask
   * @param {string} id - Task ID
   * @param {Object} subtask - Subtask data { title, description }
   * @returns {Promise<{ task: Object, subtask: Object }>}
   */
  addSubtask: async (id, subtask) => {
    try {
      const response = await api.post(`/tasks/${id}/subtasks`, subtask);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update subtask
   * @param {string} id - Task ID
   * @param {string} subtaskId - Subtask ID
   * @param {Object} data - Updated subtask data
   * @returns {Promise<{ task: Object }>}
   */
  updateSubtask: async (id, subtaskId, data) => {
    try {
      const response = await api.put(
        `/tasks/${id}/subtasks/${subtaskId}`,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Toggle subtask completion
   * @param {string} id - Task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<{ task: Object }>}
   */
  toggleSubtask: async (id, subtaskId) => {
    try {
      const response = await api.patch(
        `/tasks/${id}/subtasks/${subtaskId}/toggle`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete subtask
   * @param {string} id - Task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<{ task: Object }>}
   */
  deleteSubtask: async (id, subtaskId) => {
    try {
      const response = await api.delete(`/tasks/${id}/subtasks/${subtaskId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reorder subtasks
   * @param {string} id - Task ID
   * @param {Array<{id: string, order: number}>} subtasks - Array of subtask IDs with new order
   * @returns {Promise<{ task: Object }>}
   */
  reorderSubtasks: async (id, subtasks) => {
    try {
      const response = await api.patch(`/tasks/${id}/subtasks/reorder`, {
        subtasks,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ATTACHMENTS
  // ============================================

  /**
   * Add attachment to task
   * @param {string} id - Task ID
   * @param {File} file - File to attach
   * @returns {Promise<{ task: Object, attachment: Object }>}
   */
  addAttachment: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post(`/tasks/${id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete attachment
   * @param {string} id - Task ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<{ task: Object }>}
   */
  deleteAttachment: async (id, attachmentId) => {
    try {
      const response = await api.delete(
        `/tasks/${id}/attachments/${attachmentId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Download attachment
   * @param {string} id - Task ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<Blob>}
   */
  downloadAttachment: async (id, attachmentId) => {
    try {
      const response = await api.get(
        `/tasks/${id}/attachments/${attachmentId}/download`,
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // TAGS
  // ============================================

  /**
   * Add tags to task
   * @param {string} id - Task ID
   * @param {Array<string>} tags - Tags to add
   * @returns {Promise<{ task: Object }>}
   */
  addTags: async (id, tags) => {
    try {
      const response = await api.post(`/tasks/${id}/tags`, { tags });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Remove tags from task
   * @param {string} id - Task ID
   * @param {Array<string>} tags - Tags to remove
   * @returns {Promise<{ task: Object }>}
   */
  removeTags: async (id, tags) => {
    try {
      const response = await api.delete(`/tasks/${id}/tags`, {
        data: { tags },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * Add dependency to task
   * @param {string} id - Task ID
   * @param {string} dependencyTaskId - ID of task to create dependency with
   * @param {string} type - Dependency type: 'blocks', 'blocked_by', 'relates_to'
   * @returns {Promise<{ task: Object }>}
   */
  addDependency: async (id, dependencyTaskId, type = "relates_to") => {
    try {
      const response = await api.post(`/tasks/${id}/dependencies`, {
        dependencyTaskId,
        type,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Remove dependency from task
   * @param {string} id - Task ID
   * @param {string} dependencyId - Dependency ID
   * @returns {Promise<{ task: Object }>}
   */
  removeDependency: async (id, dependencyId) => {
    try {
      const response = await api.delete(
        `/tasks/${id}/dependencies/${dependencyId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  /**
   * Update task progress
   * @param {string} id - Task ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Promise<{ task: Object }>}
   */
  updateProgress: async (id, progress) => {
    try {
      const response = await api.patch(`/tasks/${id}/progress`, { progress });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Log time spent on task
   * @param {string} id - Task ID
   * @param {number} hours - Hours spent
   * @param {string} description - Description of work done
   * @returns {Promise<{ task: Object }>}
   */
  logTime: async (id, hours, description = "") => {
    try {
      const response = await api.post(`/tasks/${id}/time-log`, {
        hours,
        description,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ARCHIVE & RESTORE
  // ============================================

  /**
   * Archive task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  archive: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/archive`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Unarchive/restore task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  unarchive: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/unarchive`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get archived tasks
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ tasks: Array, pagination: Object }>}
   */
  getArchived: async (params = {}) => {
    try {
      const response = await api.get("/tasks/archived", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // VIEWS & FILTERS
  // ============================================

  /**
   * Get task board view (Kanban style)
   * @param {Object} filters - Additional filters
   * @returns {Promise<{ columns: Object }>}
   */
  getBoard: async (filters = {}) => {
    try {
      const response = await api.get("/tasks/board", { params: filters });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get my tasks (assigned to current user)
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ tasks: Array }>}
   */
  getMyTasks: async (params = {}) => {
    try {
      const response = await api.get("/tasks/my", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get overdue tasks
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ tasks: Array }>}
   */
  getOverdue: async (params = {}) => {
    try {
      const response = await api.get("/tasks/overdue", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get tasks due today
   * @returns {Promise<{ tasks: Array }>}
   */
  getDueToday: async () => {
    try {
      const response = await api.get("/tasks/due-today");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get upcoming tasks (due within specified days)
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<{ tasks: Array }>}
   */
  getUpcoming: async (days = 7) => {
    try {
      const response = await api.get("/tasks/upcoming", { params: { days } });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get tasks by event
   * @param {string} eventId - Event ID
   * @returns {Promise<{ tasks: Array }>}
   */
  getByEvent: async (eventId) => {
    try {
      const response = await api.get(`/tasks/event/${eventId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get tasks by client
   * @param {string} clientId - Client ID
   * @returns {Promise<{ tasks: Array }>}
   */
  getByClient: async (clientId) => {
    try {
      const response = await api.get(`/tasks/client/${clientId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get tasks by partner
   * @param {string} partnerId - Partner ID
   * @returns {Promise<{ tasks: Array }>}
   */
  getByPartner: async (partnerId) => {
    try {
      const response = await api.get(`/tasks/partner/${partnerId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search tasks
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<{ tasks: Array }>}
   */
  search: async (query, filters = {}) => {
    try {
      const response = await api.get("/tasks/search", {
        params: { q: query, ...filters },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  /**
   * Get task statistics
   * @param {Object} params - Filter parameters (dateRange, userId, etc.)
   * @returns {Promise<{ stats: Object }>}
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get("/tasks/stats", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get task completion rate over time
   * @param {Object} params - { startDate, endDate, groupBy }
   * @returns {Promise<{ data: Array }>}
   */
  getCompletionRate: async (params = {}) => {
    try {
      const response = await api.get("/tasks/analytics/completion-rate", {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get task distribution by category/priority/status
   * @param {string} groupBy - Field to group by
   * @returns {Promise<{ distribution: Object }>}
   */
  getDistribution: async (groupBy = "status") => {
    try {
      const response = await api.get("/tasks/analytics/distribution", {
        params: { groupBy },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get user productivity metrics
   * @param {string} userId - User ID (optional, defaults to current user)
   * @param {Object} params - Date range parameters
   * @returns {Promise<{ metrics: Object }>}
   */
  getUserProductivity: async (userId = null, params = {}) => {
    try {
      const url = userId
        ? `/tasks/analytics/user/${userId}`
        : "/tasks/analytics/me";
      const response = await api.get(url, { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk update tasks
   * @param {Array<string>} ids - Array of task IDs
   * @param {Object} data - Fields to update
   * @returns {Promise<{ updated: number, tasks: Array }>}
   */
  bulkUpdate: async (ids, data) => {
    try {
      const response = await api.patch("/tasks/bulk-update", { ids, data });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk assign tasks
   * @param {Array<string>} ids - Array of task IDs
   * @param {string} userId - User ID to assign to
   * @returns {Promise<{ updated: number }>}
   */
  bulkAssign: async (ids, userId) => {
    try {
      const response = await api.patch("/tasks/bulk-assign", { ids, userId });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk complete tasks
   * @param {Array<string>} ids - Array of task IDs
   * @returns {Promise<{ completed: number }>}
   */
  bulkComplete: async (ids) => {
    try {
      const response = await api.post("/tasks/bulk-complete", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk archive tasks
   * @param {Array<string>} ids - Array of task IDs
   * @returns {Promise<{ archived: number }>}
   */
  bulkArchive: async (ids) => {
    try {
      const response = await api.post("/tasks/bulk-archive", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // TEMPLATES & DUPLICATION
  // ============================================

  /**
   * Duplicate/clone a task
   * @param {string} id - Task ID to duplicate
   * @param {Object} overrides - Fields to override in the duplicate
   * @returns {Promise<{ task: Object }>}
   */
  duplicate: async (id, overrides = {}) => {
    try {
      const response = await api.post(`/tasks/${id}/duplicate`, overrides);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create task from template
   * @param {string} templateId - Template ID
   * @param {Object} data - Task-specific data
   * @returns {Promise<{ task: Object }>}
   */
  createFromTemplate: async (templateId, data = {}) => {
    try {
      const response = await api.post(
        `/tasks/templates/${templateId}/create`,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // EXPORT & REPORTING
  // ============================================

  /**
   * Export tasks to CSV/Excel
   * @param {Object} filters - Filter parameters
   * @param {string} format - Export format: 'csv' or 'excel'
   * @returns {Promise<Blob>}
   */
  export: async (filters = {}, format = "csv") => {
    try {
      const response = await api.get("/tasks/export", {
        params: { ...filters, format },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Generate task report
   * @param {Object} params - Report parameters
   * @returns {Promise<{ report: Object }>}
   */
  generateReport: async (params = {}) => {
    try {
      const response = await api.post("/tasks/reports/generate", params);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// REMINDER SERVICE
// ============================================
export const reminderService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/reminders", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/reminders/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/reminders", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/reminders/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/reminders/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  snooze: async (id, data) => {
    try {
      const response = await api.post(`/reminders/${id}/snooze`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getUpcoming: async () => {
    try {
      const response = await api.get("/reminders/upcoming");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// TEAM SERVICE
// ============================================
export const teamService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/team", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/team/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/team/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/team/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  invite: async (data) => {
    try {
      const response = await api.post("/team/invite", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getInvitations: async () => {
    try {
      const response = await api.get("/team/invitations");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  acceptInvitation: async (token) => {
    try {
      const response = await api.post("/team/accept-invitation", { token });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  resendInvitation: async (id) => {
    try {
      const response = await api.post(`/team/invitations/${id}/resend`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  cancelInvitation: async (id) => {
    try {
      const response = await api.delete(`/team/invitations/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/team/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// ROLE SERVICE
// ============================================
export const roleService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/roles", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/roles", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/roles/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getPermissions: async () => {
    try {
      const response = await api.get("/roles/permissions");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// VENUE SERVICE
// ============================================
export const venueService = {
  getMe: async () => {
    try {
      const response = await api.get("/venues/me");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (data) => {
    try {
      const response = await api.put("/venues/me", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/venues/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get("/venues/dashboard");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateSubscription: async (data) => {
    try {
      const response = await api.put("/venues/subscription", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<{ stats }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/venues/dashboard");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get upcoming events for dashboard
   * @param {Object} params - { limit }
   * @returns {Promise<{ events: Array }>}
   */
  getUpcomingEvents: async (params = { limit: 5 }) => {
    try {
      const response = await api.get("/events", {
        params: { ...params, upcoming: true },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get recent payments for dashboard
   * @param {Object} params - { limit }
   * @returns {Promise<{ payments: Array }>}
   */
  getRecentPayments: async (params = { limit: 5 }) => {
    try {
      const response = await api.get("/payments", {
        params: { ...params, recent: true },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get user's tasks for dashboard
   * @returns {Promise<{ tasks: Array }>}
   */
  getTasks: async () => {
    try {
      const response = await api.get("/tasks/my");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// INVOICE SERVICE
// ============================================
export const invoiceService = {
  /**
   * Get all invoices with filters
   * @param {Object} params - { search, status, invoiceType, client, partner, event, startDate, endDate, page, limit }
   * @returns {Promise<{ invoices: Array, pagination }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/invoices", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<{ invoice }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new invoice (client or partner)
   * @param {Object} data - Invoice data including invoiceType, client/partner, items, etc.
   * @returns {Promise<{ invoice }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/invoices", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create client invoice
   * @param {Object} data - Invoice data with client reference
   * @returns {Promise<{ invoice }>}
   */
  createClientInvoice: async (data) => {
    try {
      const response = await api.post("/invoices", {
        ...data,
        invoiceType: "client",
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create partner invoice/bill
   * @param {Object} data - Invoice data with partner reference
   * @returns {Promise<{ invoice }>}
   */
  createPartnerInvoice: async (data) => {
    try {
      const response = await api.post("/invoices", {
        ...data,
        invoiceType: "partner",
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update invoice
   * @param {string} id - Invoice ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ invoice }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/invoices/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Send invoice via email
   * @param {string} id - Invoice ID
   * @param {Object} data - { email, message }
   * @returns {Promise<{ invoice }>}
   */
  send: async (id, data = {}) => {
    try {
      const response = await api.post(`/invoices/${id}/send`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Download invoice PDF
   * @param {string} id - Invoice ID
   * @returns {Promise<Blob>}
   */
  download: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Mark invoice as paid
   * @param {string} id - Invoice ID
   * @param {Object} data - { paymentMethod, reference }
   * @returns {Promise<{ invoice }>}
   */
  markAsPaid: async (id, data = {}) => {
    try {
      const response = await api.patch(`/invoices/${id}/paid`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cancel invoice
   * @param {string} id - Invoice ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<{ invoice }>}
   */
  cancel: async (id, reason = "") => {
    try {
      const response = await api.patch(`/invoices/${id}/cancel`, { reason });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get invoice statistics
   * @param {Object} params - { startDate, endDate, invoiceType }
   * @returns {Promise<{ stats, overdue, dueSoon, monthlyRevenue }>}
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get("/invoices/stats", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get client invoices
   * @param {string} clientId - Client ID
   * @returns {Promise<{ invoices: Array }>}
   */
  getByClient: async (clientId) => {
    try {
      const response = await api.get(`/invoices/client/${clientId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get partner invoices
   * @param {string} partnerId - Partner ID
   * @returns {Promise<{ invoices: Array }>}
   */
  getByPartner: async (partnerId) => {
    try {
      const response = await api.get(`/invoices/partner/${partnerId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get event invoices (both client and partner)
   * @param {string} eventId - Event ID
   * @returns {Promise<{ invoices: Array }>}
   */
  getByEvent: async (eventId) => {
    try {
      const response = await api.get(`/invoices/event/${eventId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get client invoices with filters
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ invoices: Array, pagination }>}
   */
  getClientInvoices: async (params = {}) => {
    try {
      const response = await api.get("/invoices", {
        params: { ...params, invoiceType: "client" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get partner invoices with filters
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ invoices: Array, pagination }>}
   */
  getPartnerInvoices: async (params = {}) => {
    try {
      const response = await api.get("/invoices", {
        params: { ...params, invoiceType: "partner" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get overdue invoices
   * @param {string} invoiceType - Optional: 'client' or 'partner'
   * @returns {Promise<{ invoices: Array }>}
   */
  getOverdue: async (invoiceType = null) => {
    try {
      const params = { status: "overdue" };
      if (invoiceType) {
        params.invoiceType = invoiceType;
      }
      const response = await api.get("/invoices", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get unpaid invoices
   * @param {string} invoiceType - Optional: 'client' or 'partner'
   * @returns {Promise<{ invoices: Array }>}
   */
  getUnpaid: async (invoiceType = null) => {
    try {
      const params = { status: "unpaid" };
      if (invoiceType) {
        params.invoiceType = invoiceType;
      }
      const response = await api.get("/invoices", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
// ============================================
// USER SERVICE
// ============================================
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
// ============================================
// EXPORT ALL SERVICES
// ============================================
export default {
  authService,
  eventService,
  clientService,
  partnerService,
  paymentService,
  financeService,
  taskService,
  reminderService,
  teamService,
  roleService,
  venueService,
  dashboardService,
  invoiceService,
  userService,
};
