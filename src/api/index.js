//fiesta_events/src/api/index.js
/**
 * ============================================
 * Fiesta Events - CONSOLIDATED API SERVICES
 * ============================================
 * *
 */

import api from "./axios";
import { handleResponse, handleError } from "../utils/apiUtils.js";

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
   * Backend handles: status, type, clientId, startDate, endDate, search, includeArchived
   * @param {Object} params - { status, startDate, endDate, clientId, page, limit, includeArchived }
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
   * Includes pricing, partners (as services), and basic info
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
   * Archive event (Soft Delete)
   * Maps to DELETE /api/v1/events/:id
   * @param {string} id - Event ID
   * @returns {Promise<{ event }>}
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
   * Restore archived event
   * Maps to PATCH /api/v1/events/:id/restore
   * @param {string} id - Event ID
   * @returns {Promise<{ event }>}
   */
  restore: async (id) => {
    try {
      const response = await api.patch(`/events/${id}/restore`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get events by client ID
   * @param {string} clientId - Client ID
   * @param {Object} params - Query parameters
   * @returns {Promise<{ events: Array, client: Object, stats: Object, pagination: Object }>}
   */
  getByClientId: async (clientId, params = {}) => {
    try {
      const response = await api.get(`/events/client/${clientId}`, { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get event statistics
   * Maps to GET /api/v1/events/stats
   * @returns {Promise<{ statusStats: Array, typeStats: Array, summary: Object }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/events/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // HELPER METHODS (Adapters for UI Convenience)
  // ============================================

  /**
   * Get archived events
   * Uses getAll with includeArchived filter
   */
  getArchived: async (params = {}) => {
    return eventService.getAll({ ...params, includeArchived: true });
  },

  /**
   * Get calendar view of events
   * Uses getAll with date range filters
   * @param {Object} params - { month, year, start, end }
   */
  getCalendar: async (params = {}) => {
    // If specific start/end provided, use them, otherwise calculate based on month/year
    const queryParams = { ...params };
    delete queryParams.month; // Cleanup
    delete queryParams.year;  // Cleanup
    
    return eventService.getAll({ ...queryParams, limit: 100 }); // Fetch more items for calendar view
  },

  /**
   * Update event status helper
   * Wraps the generic update method
   */
  updateStatus: async (id, status) => {
    return eventService.update(id, { status });
  },
  allocateSupplies: (eventId) => api.post(`/events/${eventId}/supplies/allocate`),
  returnSupplies: (eventId) => api.post(`/events/${eventId}/supplies/return`),
  markSuppliesDelivered: (eventId) => api.patch(`/events/${eventId}/supplies/delivered`),

};

// ============================================
// CLIENT SERVICE
// ============================================
export const clientService = {
  /**
   * Get all clients with optional filters
   * @param {Object} params - { search, status, page, limit, includeArchived }
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
   * Archive client (soft delete)
   * @param {string} id - Client ID
   * @returns {Promise<{ client }>}
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
   * Restore archived client
   * @param {string} id - Client ID
   * @returns {Promise<{ client }>}
   */
  restore: async (id) => {
    try {
      const response = await api.patch(`/clients/${id}/restore`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get archived clients
   * @param {Object} params - Query parameters
   * @returns {Promise<{ clients: Array, pagination: Object }>}
   */
  getArchived: async (params = {}) => {
    try {
      const response = await api.get("/clients/archived", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get client events
   * @param {string} id - Client ID
   * @param {Object} params - Query parameters
   * @returns {Promise<{ events: Array }>}
   */
  getEvents: async (id, params = {}) => {
    try {
      const response = await api.get(`/clients/${id}/events`, { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get client statistics
   * @returns {Promise<{ total, active, inactive, newClientsThisMonth, topClients }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/clients/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search clients by name, email, or phone
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<{ clients: Array }>}
   */
  search: async (query, params = {}) => {
    try {
      const response = await api.get("/clients", {
        params: { ...params, search: query },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk update clients
   * @param {Array} ids - Array of client IDs
   * @param {Object} data - Data to update
   * @returns {Promise<{ updatedCount: number }>}
   */
  bulkUpdate: async (ids, data) => {
    try {
      const response = await api.patch("/clients/bulk-update", { ids, data });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk archive clients
   * @param {Array} ids - Array of client IDs
   * @returns {Promise<{ archivedCount: number }>}
   */
  bulkArchive: async (ids) => {
    try {
      const response = await api.post("/clients/bulk-archive", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk restore clients
   * @param {Array} ids - Array of client IDs
   * @returns {Promise<{ restoredCount: number }>}
   */
  bulkRestore: async (ids) => {
    try {
      const response = await api.post("/clients/bulk-restore", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Import clients from CSV or other sources
   * @param {Array} clients - Array of client objects
   * @returns {Promise<{ imported: number, errors: Array }>}
   */
  import: async (clients) => {
    try {
      const response = await api.post("/clients/import", { clients });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export clients to CSV
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ csv: string }>}
   */
  export: async (params = {}) => {
    try {
      const response = await api.get("/clients/export", {
        params,
        responseType: "blob",
      });
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
   * Get all tasks with filtering and pagination
   * @param {Object} params - Filter parameters (page, limit, status, priority, etc.)
   * @returns {Promise<{ tasks: Array, pagination: Object }>}
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
   * Get single task by ID
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
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

  // ============================================
  // STATUS & ASSIGNMENT
  // ============================================

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - New status
   * @returns {Promise<{ task: Object }>}
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });
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

  // ============================================
  // SUBTASKS
  // ============================================

  /**
   * Add subtask
   * @param {string} id - Task ID
   * @param {Object} subtask - Subtask data { title }
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
   * @returns {Promise<{ board: Object }>}
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
   * @returns {Promise<{ tasks: Object }>}
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
   * @returns {Promise<{ tasks: Array, count: number }>}
   */
  getOverdue: async () => {
    try {
      const response = await api.get("/tasks/overdue");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get tasks due today
   * @returns {Promise<{ tasks: Array, count: number }>}
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
   * @returns {Promise<{ tasks: Array, count: number }>}
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
   * Search tasks (Full text search on title/description)
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<{ tasks: Array, count: number }>}
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
  // STATISTICS
  // ============================================

  /**
   * Get general task statistics
   * @returns {Promise<{ stats: Object }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/tasks/stats");
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
   * @returns {Promise<{ updated: number }>}
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
   * Bulk delete tasks
   * @param {Array<string>} ids - Array of task IDs
   * @returns {Promise<{ deleted: number }>}
   */
  bulkDelete: async (ids) => {
    try {
      const response = await api.post("/tasks/bulk-delete", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Duplicate/clone a task
   * @param {string} id - Task ID to duplicate
   * @param {Object} overrides - Fields to override
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
   * Export tasks to CSV/Excel
   * @param {Object} filters - Filter parameters
   * @param {string} format - Export format
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
};

// ============================================
// REMINDER SERVICE
// ============================================
export const reminderService = {
  /**
   * Get reminders list (List View)
   * @param {Object} params - { status: 'active' | 'completed', page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/reminders", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single reminder
   * @param {string} id 
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/reminders/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new reminder
   * @param {Object} data 
   */
  create: async (data) => {
    try {
      const response = await api.post("/reminders", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update reminder
   * @param {string} id 
   * @param {Object} data 
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/reminders/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete reminder (Archive)
   * @param {string} id 
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/reminders/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Toggle Complete Status (Done / Not Done)
   * @param {string} id 
   */
  toggleComplete: async (id) => {
    try {
      const response = await api.patch(`/reminders/${id}/toggle-complete`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get upcoming reminders (For Notification Badge)
   * Fetches ALL future active reminders.
   */
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
  /**
   * Get current venue details
   * @returns {Promise<{ venue }>}
   */
  getMe: async () => {
    try {
      const response = await api.get("/venues/me");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update venue details
   * @param {Object} data - Venue fields to update
   * @returns {Promise<{ venue }>}
   */
  update: async (data) => {
    try {
      const response = await api.put("/venues/me", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get venue spaces (alias for venueSpacesService.getAll)
   * @param {Object} params - Query parameters
   * @returns {Promise<{ spaces: Array, pagination: Object }>}
   */
  getSpaces: async (params = {}) => {
    try {
      const response = await api.get("/venues/spaces", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload space images
   * @param {string} spaceId - Space ID
   * @param {FormData} formData - Image files
   * @returns {Promise<{ images: Array }>}
   */
  uploadSpaceImages: async (spaceId, formData) => {
    try {
      const response = await api.post(
        `/venues/spaces/${spaceId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete space image
   * @param {string} spaceId - Space ID
   * @param {string} imageId - Image ID
   * @returns {Promise<{ success: boolean }>}
   */
  deleteSpaceImage: async (spaceId, imageId) => {
    try {
      const response = await api.delete(
        `/venues/spaces/${spaceId}/images/${imageId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload venue images
   * @param {FormData} formData - Image files
   * @returns {Promise<{ images: Array }>}
   */
  uploadImages: async (formData) => {
    try {
      const response = await api.post("/venues/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete venue image
   * @param {string} imageId - Image ID
   * @returns {Promise<{ success: boolean }>}
   */
  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/venues/images/${imageId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload space images
   * @param {string} spaceId - Space ID
   * @param {FormData} formData - Image files
   * @returns {Promise<{ images: Array }>}
   */
  uploadSpaceImages: async (spaceId, formData) => {
    try {
      const response = await api.post(
        `/venues/spaces/${spaceId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete space image
   * @param {string} spaceId - Space ID
   * @param {string} imageId - Image ID
   * @returns {Promise<{ success: boolean }>}
   */
  deleteSpaceImage: async (spaceId, imageId) => {
    try {
      const response = await api.delete(
        `/venues/spaces/${spaceId}/images/${imageId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get venue statistics
   * @returns {Promise<{ totalEvents, upcomingEvents, totalClients, totalPartners, totalRevenue, teamSize }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/venues/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get venue dashboard data
   * @returns {Promise<{ upcomingEvents, recentPayments, pendingTasks, upcomingReminders, summary }>}
   */
  getDashboard: async () => {
    try {
      const response = await api.get("/venues/dashboard");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update venue subscription
   * @param {Object} data - { plan, status, endDate, amount }
   * @returns {Promise<{ venue }>}
   */
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
// VENUE SPACES SERVICE
// ============================================
export const venueSpacesService = {
  /**
   * Get all venue spaces with optional filters
   * @param {Object} params - { search, status, capacityMin, capacityMax, amenities, page, limit }
   * @returns {Promise<{ spaces: Array, pagination }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/venues/spaces", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single space by ID
   * @param {string} id - Space ID
   * @returns {Promise<{ space }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/venues/spaces/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new venue space
   * @param {Object} data - Space data { name, description, capacity, amenities, hourlyRate, dailyRate, status, images }
   * @returns {Promise<{ space }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/venues/spaces", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update venue space
   * @param {string} id - Space ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ space }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/venues/spaces/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete venue space
   * @param {string} id - Space ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/venues/spaces/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update space status
   * @param {string} id - Space ID
   * @param {string} status - New status (active, maintenance, unavailable)
   * @returns {Promise<{ space }>}
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/venues/spaces/${id}/status`, {
        status,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get space availability
   * @param {string} id - Space ID
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise<{ available: boolean, conflicts: Array }>}
   */
  getAvailability: async (id, params = {}) => {
    try {
      const response = await api.get(`/venues/spaces/${id}/availability`, {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Check multiple spaces availability
   * @param {Object} params - { spaceIds, startDate, endDate }
   * @returns {Promise<{ availability: Array }>}
   */
  checkAvailability: async (params = {}) => {
    try {
      const response = await api.get("/venues/spaces/availability", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get space events
   * @param {string} id - Space ID
   * @param {Object} params - { startDate, endDate, status }
   * @returns {Promise<{ events: Array }>}
   */
  getEvents: async (id, params = {}) => {
    try {
      const response = await api.get(`/venues/spaces/${id}/events`, { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get space bookings
   * @param {string} id - Space ID
   * @param {Object} params - { startDate, endDate, status }
   * @returns {Promise<{ bookings: Array }>}
   */
  getBookings: async (id, params = {}) => {
    try {
      const response = await api.get(`/venues/spaces/${id}/bookings`, {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload space images
   * @param {string} id - Space ID
   * @param {FormData} formData - Image files
   * @returns {Promise<{ images: Array }>}
   */
  uploadImages: async (id, formData) => {
    try {
      const response = await api.post(`/venues/spaces/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete space image
   * @param {string} id - Space ID
   * @param {string} imageId - Image ID
   * @returns {Promise<{ success: boolean }>}
   */
  deleteImage: async (id, imageId) => {
    try {
      const response = await api.delete(
        `/venues/spaces/${id}/images/${imageId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reorder space images
   * @param {string} id - Space ID
   * @param {Array} imageOrder - Array of image IDs in desired order
   * @returns {Promise<{ space }>}
   */
  reorderImages: async (id, imageOrder) => {
    try {
      const response = await api.patch(`/venues/spaces/${id}/images/reorder`, {
        imageOrder,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Set primary image for space
   * @param {string} id - Space ID
   * @param {string} imageId - Image ID to set as primary
   * @returns {Promise<{ space }>}
   */
  setPrimaryImage: async (id, imageId) => {
    try {
      const response = await api.patch(`/venues/spaces/${id}/images/primary`, {
        imageId,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get space statistics
   * @param {string} id - Space ID
   * @returns {Promise<{ stats }>}
   */
  getStats: async (id) => {
    try {
      const response = await api.get(`/venues/spaces/${id}/stats`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all spaces statistics
   * @returns {Promise<{ spaces: Array, utilization: Object, revenue: Object }>}
   */
  getAllStats: async () => {
    try {
      const response = await api.get("/venues/spaces/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search spaces by criteria
   * @param {Object} params - { query, capacity, amenities, dateRange, priceRange }
   * @returns {Promise<{ spaces: Array }>}
   */
  search: async (params = {}) => {
    try {
      const response = await api.get("/venues/spaces/search", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk update spaces
   * @param {Array} spaceIds - Array of space IDs
   * @param {Object} data - Fields to update
   * @returns {Promise<{ updated: number }>}
   */
  bulkUpdate: async (spaceIds, data) => {
    try {
      const response = await api.patch("/venues/spaces/bulk-update", {
        spaceIds,
        data,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk delete spaces
   * @param {Array} spaceIds - Array of space IDs
   * @returns {Promise<{ deleted: number }>}
   */
  bulkDelete: async (spaceIds) => {
    try {
      const response = await api.post("/venues/spaces/bulk-delete", {
        spaceIds,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Duplicate space
   * @param {string} id - Space ID to duplicate
   * @param {Object} overrides - Fields to override in the duplicate
   * @returns {Promise<{ space }>}
   */
  duplicate: async (id, overrides = {}) => {
    try {
      const response = await api.post(
        `/venues/spaces/${id}/duplicate`,
        overrides
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export spaces to CSV/Excel
   * @param {Object} filters - Filter parameters
   * @param {string} format - Export format: 'csv' or 'excel'
   * @returns {Promise<Blob>}
   */
  export: async (filters = {}, format = "csv") => {
    try {
      const response = await api.get("/venues/spaces/export", {
        params: { ...filters, format },
        responseType: "blob",
      });
      return response.data;
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
   * @param {Object} params - { page, limit, search, status, type, startDate, endDate }
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
   * Get invoice by ID
   * @param {string} id
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
   * Create new invoice
   * @param {Object} data
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
   * Update invoice
   * @param {string} id
   * @param {Object} data
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
   * Delete invoice (Archive)
   * @param {string} id
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
   * @param {string} id
   * @param {Object} data - { message, sendCopy }
   * @returns {Promise<{ success: boolean }>}
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
   * Mark invoice as paid
   * @param {string} id
   * @param {Object} data - { paymentMethod, notes }
   * @returns {Promise<{ invoice }>}
   */
  markAsPaid: async (id, data = {}) => {
    try {
      const response = await api.post(`/invoices/${id}/mark-paid`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cancel invoice
   * @param {string} id
   * @param {string} reason
   * @returns {Promise<{ invoice }>}
   */
  cancel: async (id, reason = "") => {
    try {
      const response = await api.post(`/invoices/${id}/cancel`, { reason });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

/**
   * Download invoice PDF
   * @param {string} id
   * @param {string} language
   * @returns {Promise<Blob>}
   */
  download: async (id, language = "fr") => {
    try {
      const response = await api.get(`/invoices/${id}/download`, {
        params: { language },
        responseType: "blob", // Critical
        headers: { Accept: "application/pdf" },
      });

      // ✅ FIX: Check if the Blob is nested in .data (based on your logs)
      if (response.data && response.data instanceof Blob) {
        return response.data;
      }
      
      // Fallback: If your interceptor already unwrapped it, return response
      return response;
    } catch (error) {
      console.error("Download service error:", error);
      throw error;
    }
  },
  /**
   * Get invoice statistics
   * @param {Object} params - { startDate, endDate, invoiceType }
   * @returns {Promise<{ stats }>}
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get("/invoices/stats", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // INVOICE SETTINGS & CUSTOMIZATION
  // ============================================

  /**
   * Get invoice settings
   * @returns {Promise<{ data: Object }>}
   */
  getSettings: async () => {
    try {
      const response = await api.get("/invoices/settings");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update invoice settings
   * @param {Object} data - Full settings object
   * @returns {Promise<{ message: string, data: Object }>}
   */
  updateSettings: async (data) => {
    try {
      const response = await api.put("/invoices/settings", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Apply a preset template
   * @param {string} template - 'modern', 'classic', 'minimal'
   * @returns {Promise<{ message: string, data: Object }>}
   */
  applyTemplate: async (template) => {
    try {
      const response = await api.post("/invoices/settings/apply-template", {
        template,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reset settings to system defaults
   * @returns {Promise<{ message: string, data: Object }>}
   */
  resetSettings: async () => {
    try {
      const response = await api.post("/invoices/settings/reset");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Generate a preview based on data (for the settings editor)
   * @param {Object} invoiceData - Dummy data or current settings
   * @returns {Promise<{ data: Object }>}
   */
  preview: async (invoiceData) => {
    try {
      const response = await api.post("/invoices/settings/preview", {
        invoiceData,
      });
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
// CONTRACT SERVICE
// ============================================
export const contractService = {

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  getAll: async (params = {}) => {
    const response = await api.get("/contracts", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/contracts", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },

  // ============================================
  // ARCHIVE OPERATIONS
  // ============================================

  archive: async (id) => {
    const response = await api.patch(`/contracts/${id}/archive`);
    return response.data;
  },

  restore: async (id) => {
    const response = await api.patch(`/contracts/${id}/restore`);
    return response.data;
  },

  // ============================================
  // WORKFLOW & ACTIONS
  // ============================================

  send: async (id) => {
    const response = await api.post(`/contracts/${id}/send`);
    return response.data;
  },

  markViewed: async (id) => {
    const response = await api.patch(`/contracts/${id}/view`);
    return response.data;
  },

  sign: async (id, signatureData) => {
    const response = await api.post(`/contracts/${id}/sign`, signatureData);
    return response.data;
  },

  duplicate: async (id) => {
    const response = await api.post(`/contracts/${id}/duplicate`);
    return response.data;
  },

  /**
   * Download PDF
   * Endpoint: GET /api/contracts/:id/download
   * Note: We use responseType: 'blob' to handle binary file data
   */
  download: async (id) => {
    const response = await api.get(`/contracts/${id}/download`, {
      responseType: 'blob' 
    });
    return response.data;
  },

  // ============================================
  // SETTINGS & CONFIG
  // ============================================

  getSettings: async () => {
  const response = await api.get("/contracts/settings");
  return response.data;
  },

  updateSettings: async (data) => {
  // Use longer timeout for settings update (large payload)
  const response = await api.put("/contracts/settings", data, {
    timeout: 60000, // 60 seconds timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
},

// ============================================
// ALTERNATIVE: Split into smaller updates
// ============================================

// If the above still times out, use these granular update methods:

updateCompanyInfo: async (companyInfo) => {
  const response = await api.patch("/contracts/settings/company", { companyInfo });
  return response.data;
},

updateBranding: async (branding) => {
  const response = await api.patch("/contracts/settings/branding", { branding });
  return response.data;
},

updateFinancials: async (financialDefaults) => {
  const response = await api.patch("/contracts/settings/financials", { financialDefaults });
  return response.data;
},

updateSections: async (defaultSections) => {
  const response = await api.patch("/contracts/settings/sections", { defaultSections });
  return response.data;
},

updateCancellationPolicy: async (defaultCancellationPolicy) => {
  const response = await api.patch("/contracts/settings/cancellation", { defaultCancellationPolicy });
  return response.data;
},

updateLabels: async (labels) => {
  const response = await api.patch("/contracts/settings/labels", { labels });
  return response.data;
},

updateStructure: async (structure) => {
  const response = await api.patch("/contracts/settings/structure", { structure });
  return response.data;
},
  // ============================================
  // STATISTICS
  // ============================================

  getStats: async () => {
    const response = await api.get("/contracts/stats");
    return response.data;
  },

  // ============================================
  // HELPERS
  // ============================================

  getByEvent: async (eventId) => {
    const response = await api.get("/contracts", { params: { event: eventId } });
    return response.data;
  },

  getByClient: async (clientId) => {
    const response = await api.get("/contracts", { params: { client: clientId } });
    return response.data;
  },

  getByPartner: async (partnerId) => {
    const response = await api.get("/contracts", { params: { partner: partnerId } });
    return response.data;
  },

  getPending: async () => {
    const response = await api.get("/contracts", {
      params: { status: "sent,viewed" },
    });
    return response.data;
  },

  getExpiring: async (days = 30) => {
    const response = await api.get("/contracts", {
      params: { expiringSoon: days },
    });
    return response.data;
  },
};

// ============================================
// SUPPLY SERVICE
// ============================================
export const supplyService = {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Get all supplies with optional filters
   * @param {Object} params - { search, categoryId, status, stockStatus, page, limit }
   * @returns {Promise<{ supplies: Array, pagination }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/supplies", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single supply by ID
   * @param {string} id - Supply ID
   * @returns {Promise<{ supply }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/supplies/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new supply
   * @param {Object} data - Supply data
   * @returns {Promise<{ supply }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/supplies", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update supply
   * @param {string} id - Supply ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ supply }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/supplies/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete supply
   * @param {string} id - Supply ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/supplies/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // STOCK MANAGEMENT
  // ============================================

  /**
   * Update supply stock
   * @param {string} id - Supply ID
   * @param {Object} data - { quantity, type, reference, notes }
   * @returns {Promise<{ supply }>}
   */
  updateStock: async (id, data) => {
    try {
      const response = await api.patch(`/supplies/${id}/stock`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get stock history for a supply
   * @param {string} id - Supply ID
   * @returns {Promise<{ history: Array }>}
   */
  getStockHistory: async (id) => {
    try {
      const response = await api.get(`/supplies/${id}/history`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // CATEGORY-BASED QUERIES
  // ============================================

  /**
   * Get supplies by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<{ supplies: Array }>}
   */
  getByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/supplies/by-category/${categoryId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ALERTS & ANALYTICS
  // ============================================

  /**
   * Get low stock supplies
   * @returns {Promise<{ supplies: Array }>}
   */
  getLowStock: async () => {
    try {
      const response = await api.get("/supplies/alerts/low-stock");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get supply analytics summary
   * @returns {Promise<{ analytics: Object }>}
   */
  getAnalytics: async () => {
    try {
      const response = await api.get("/supplies/analytics/summary");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ARCHIVE OPERATIONS
  // ============================================

  /**
   * Archive supply
   * @param {string} id - Supply ID
   * @returns {Promise<{ supply }>}
   */
  archive: async (id) => {
    try {
      const response = await api.patch(`/supplies/${id}/archive`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Restore archived supply
   * @param {string} id - Supply ID
   * @returns {Promise<{ supply }>}
   */
  restore: async (id) => {
    try {
      const response = await api.patch(`/supplies/${id}/restore`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Get supplies with filters and pagination
   * @param {Object} filters - { categoryId, status, stockStatus, search }
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<{ supplies: Array, pagination }>}
   */
  getFiltered: async (filters = {}, page = 1, limit = 10) => {
    try {
      const response = await api.get("/supplies", {
        params: { ...filters, page, limit },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search supplies by name or notes
   * @param {string} query - Search term
   * @returns {Promise<{ supplies: Array }>}
   */
  search: async (query) => {
    try {
      const response = await api.get("/supplies", {
        params: { search: query },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get out of stock supplies
   * @returns {Promise<{ supplies: Array }>}
   */
  getOutOfStock: async () => {
    try {
      const response = await api.get("/supplies", {
        params: { status: "out_of_stock" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get active supplies
   * @returns {Promise<{ supplies: Array }>}
   */
  getActive: async () => {
    try {
      const response = await api.get("/supplies", {
        params: { status: "active" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk update supplies
   * @param {Array} supplyIds - Array of supply IDs
   * @param {Object} data - Fields to update for all supplies
   * @returns {Promise<{ updated: number }>}
   */
  bulkUpdate: async (supplyIds, data) => {
    try {
      const response = await api.patch("/supplies/bulk-update", {
        supplyIds,
        data,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Purchase stock (convenience method for updateStock)
   * @param {string} id - Supply ID
   * @param {number} quantity - Quantity to add
   * @param {string} reference - Purchase reference/PO number
   * @param {string} notes - Additional notes
   */
  purchaseStock: async (id, quantity, reference, notes) => {
    return supplyService.updateStock(id, {
      quantity,
      type: "purchase",
      reference,
      notes,
    });
  },

  /**
   * Record usage (convenience method for updateStock)
   * @param {string} id - Supply ID
   * @param {number} quantity - Quantity used
   * @param {string} reference - Event ID or reference
   * @param {string} notes - Additional notes
   */
  recordUsage: async (id, quantity, reference, notes) => {
    return supplyService.updateStock(id, {
      quantity,
      type: "usage",
      reference,
      notes,
    });
  },

  /**
   * Record waste (convenience method for updateStock)
   * @param {string} id - Supply ID
   * @param {number} quantity - Quantity wasted
   * @param {string} reason - Reason for waste
   */
  recordWaste: async (id, quantity, reason) => {
    return supplyService.updateStock(id, {
      quantity,
      type: "waste",
      notes: reason,
    });
  },

  /**
   * Adjust stock (convenience method for updateStock)
   * @param {string} id - Supply ID
   * @param {number} quantity - Quantity to adjust (can be positive or negative)
   * @param {string} reason - Reason for adjustment
   */
  adjustStock: async (id, quantity, reason) => {
    return supplyService.updateStock(id, {
      quantity,
      type: "adjustment",
      notes: reason,
    });
  },
    /**
   * Get supplies allocated to a specific event
   * @param {string} eventId 
   */
  getByEvent: async (eventId) => {
    try {
      // Assuming backend supports ?event=ID or a specific endpoint
      const response = await api.get(`/supplies`, { params: { event: eventId } });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// SUPPLY CATEGORY SERVICE
// ============================================
export const supplyCategoryService = {
  /**
   * Get all supply categories
   * @returns {Promise<{ categories: Array }>}
   */
  getAll: async () => {
    try {
      const response = await api.get("/supply-categories");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single category by ID
   * @param {string} id - Category ID
   * @returns {Promise<{ category }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/supply-categories/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new category
   * @param {Object} data - Category data
   * @returns {Promise<{ category }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/supply-categories", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ category }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/supply-categories/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/supply-categories/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reorder categories
   * @param {Array} data - Array of { id, order } objects
   * @returns {Promise<{ categories: Array }>}
   */
  reorder: async (data) => {
    try {
      const response = await api.patch("/supply-categories/reorder", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Initialize default categories for venue
   * @returns {Promise<{ categories: Array }>}
   */
  initializeDefaults: async () => {
    try {
      const response = await api.post("/supply-categories/initialize");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Archive category
   * @param {string} id - Category ID
   * @returns {Promise<{ category }>}
   */
  archive: async (id) => {
    try {
      const response = await api.patch(`/supply-categories/${id}/archive`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Restore archived category
   * @param {string} id - Category ID
   * @returns {Promise<{ category }>}
   */
  restore: async (id) => {
    try {
      const response = await api.patch(`/supply-categories/${id}/restore`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get active categories
   * @returns {Promise<{ categories: Array }>}
   */
  getActive: async () => {
    try {
      const response = await api.get("/supply-categories", {
        params: { status: "active" },
      });
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
  contractService,
  supplyService,
  supplyCategoryService,
};
