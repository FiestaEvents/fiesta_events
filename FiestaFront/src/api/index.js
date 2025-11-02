/**
 * ============================================
 * FIESTA VENUE MANAGEMENT - CONSOLIDATED API SERVICES
 * ============================================
 * Single source of truth for all API calls
 * Consistent response handling and error management
 * 
 * Usage:
 * import { eventService, clientService } from '@/api/services';
 * const events = await eventService.getAll({ status: 'active' });
 */

import api from './axios';

// ============================================
// RESPONSE HANDLER UTILITY
// ============================================
// Normalizes API responses to consistent structure
const handleResponse = (response) => {
  // Backend returns: { success: true, data: {...}, message: "..." }
  // We extract and return just the data
  return response.data?.data || response.data;
};

const handleError = (error) => {
  // Error structure is already handled by axios interceptor
  // Just re-throw for component-level handling
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
  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const result = handleResponse(response);
      
      // Store auth data
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.user?.venue?.id) {
          localStorage.setItem('venueId', result.user.venue.id);
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
      const response = await api.post('/auth/login', { email, password });
      const result = handleResponse(response);
      
      // Store auth data
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.user?.venue?.id) {
          localStorage.setItem('venueId', result.user.venue.id);
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
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('venueId');
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<{ user }>}
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      const result = handleResponse(response);
      
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
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
      const response = await api.put('/auth/profile', data);
      const result = handleResponse(response);
      
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
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
      const response = await api.put('/auth/change-password', {
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
      const response = await api.post('/auth/forgot-password', { email });
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
      const response = await api.post('/auth/reset-password', { token, password });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Helper methods
  isAuthenticated: () => !!localStorage.getItem('token'),
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  getVenueId: () => localStorage.getItem('venueId'),
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
      const response = await api.get('/events', { params });
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
      const response = await api.post('/events', data);
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
      const response = await api.get('/events/calendar', { params });
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
      const response = await api.get('/events/stats');
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
      const response = await api.get('/clients', { params });
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
      const response = await api.post('/clients', data);
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
      const response = await api.get('/clients/stats');
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
      const response = await api.get('/partners', { params });
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
      const response = await api.post('/partners', data);
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
      const response = await api.get('/partners/stats');
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
      const response = await api.get('/payments', { params });
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
      const response = await api.post('/payments', data);
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
      const response = await api.get('/payments/stats');
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
      const response = await api.get('/finance', { params });
      return handleResponse(response);
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
      const response = await api.post('/finance', data);
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
      const response = await api.get('/finance/summary', { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getCashflow: async () => {
    try {
      const response = await api.get('/finance/cashflow');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getExpensesBreakdown: async () => {
    try {
      const response = await api.get('/finance/expenses/breakdown');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getIncomeBreakdown: async () => {
    try {
      const response = await api.get('/finance/income/breakdown');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getProfitLoss: async () => {
    try {
      const response = await api.get('/finance/profit-loss');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getTrends: async () => {
    try {
      const response = await api.get('/finance/trends');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getTaxSummary: async () => {
    try {
      const response = await api.get('/finance/tax-summary');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// TASK SERVICE
// ============================================
export const taskService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/tasks', { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/tasks', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getBoard: async () => {
    try {
      const response = await api.get('/tasks/board');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getMyTasks: async () => {
    try {
      const response = await api.get('/tasks/my');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  addComment: async (id, comment) => {
    try {
      const response = await api.post(`/tasks/${id}/comments`, { comment });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  addSubtask: async (id, subtask) => {
    try {
      const response = await api.post(`/tasks/${id}/subtasks`, subtask);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateSubtask: async (id, subtaskId, data) => {
    try {
      const response = await api.put(`/tasks/${id}/subtasks/${subtaskId}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  deleteSubtask: async (id, subtaskId) => {
    try {
      const response = await api.delete(`/tasks/${id}/subtasks/${subtaskId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  addAttachment: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/tasks/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  deleteAttachment: async (id, attachmentId) => {
    try {
      const response = await api.delete(`/tasks/${id}/attachments/${attachmentId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/tasks/stats');
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
      const response = await api.get('/reminders', { params });
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
      const response = await api.post('/reminders', data);
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
      const response = await api.get('/reminders/upcoming');
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
      const response = await api.get('/team', { params });
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
      const response = await api.post('/team/invite', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getInvitations: async () => {
    try {
      const response = await api.get('/team/invitations');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  acceptInvitation: async (token) => {
    try {
      const response = await api.post('/team/accept-invitation', { token });
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
      const response = await api.get('/team/stats');
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
      const response = await api.get('/roles', { params });
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
      const response = await api.post('/roles', data);
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
      const response = await api.get('/roles/permissions');
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
      const response = await api.get('/venues/me');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (data) => {
    try {
      const response = await api.put('/venues/me', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/venues/stats');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get('/venues/dashboard');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateSubscription: async (data) => {
    try {
      const response = await api.put('/venues/subscription', data);
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
      const response = await api.get('/venues/dashboard');
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
      const response = await api.get('/events', { 
        params: { ...params, upcoming: true } 
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
      const response = await api.get('/payments', { 
        params: { ...params, recent: true } 
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
      const response = await api.get('/tasks/my');
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
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/invoices', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/invoices/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  send: async (id) => {
    try {
      const response = await api.post(`/invoices/${id}/send`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  download: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob',
      });
      return response.data; // Return blob directly
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
      const response = await api.get('/users', { params });
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
      const response = await api.post('/users', data);
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
      const response = await api.get('/users/stats');
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
      const response = await api.get('/users/search', { 
        params: { q: query, ...params } 
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
      const response = await api.patch('/users/bulk-update', { userIds, data });
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
      const response = await api.get('/users', { params: { role } });
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
      const response = await api.get('/auth/me');
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
      formData.append('avatar', file);
      const response = await api.post(`/users/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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