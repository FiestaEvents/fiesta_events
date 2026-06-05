import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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
    const response = await api.put(`/supplies/${id}`, data);
    return response.data;
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