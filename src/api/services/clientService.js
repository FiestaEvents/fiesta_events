
// ============================================
// CLIENT SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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