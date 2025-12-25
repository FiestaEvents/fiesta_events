
// ============================================
// INVOICE SERVICE
// ============================================

import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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