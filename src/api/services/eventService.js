
// ============================================
// EVENT SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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
      const response = await api.get(`/events/event/${clientId}`, { params });
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