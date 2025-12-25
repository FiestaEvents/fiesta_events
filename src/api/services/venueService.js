import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

// ============================================
// BUSINESS SERVICE (Formerly Venue)
// ============================================
export const venueService = {
  /**
   * Get current business details
   */
  getMe: async () => {
    try {
      const response = await api.get("/business/me");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update business details
   */
  update: async (data) => {
    try {
      const response = await api.put("/business/me", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get business resources (spaces/vehicles)
   */
  getSpaces: async (params = {}) => {
    try {
      const response = await api.get("/business/resources", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get business statistics
   */
  getStats: async () => {
    try {
      const response = await api.get("/business/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get business dashboard data
   */
  getDashboard: async () => {
    try {
      const response = await api.get("/business/dashboard");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update business subscription
   */
  updateSubscription: async (data) => {
    try {
      const response = await api.put("/business/subscription", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload business images (General)
   */
  uploadImages: async (formData) => {
    try {
      // Note: Backend might need specific route for generic business images
      // Assuming reuse of previous logic or new endpoint
      const response = await api.post("/business/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete business image
   */
  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/business/images/${imageId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// RESOURCE SERVICE (Formerly Venue Spaces)
// ============================================
export const venueSpacesService = {
  /**
   * Get all resources
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/business/resources", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single resource
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/business/resources/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new resource
   */
  create: async (data) => {
    try {
      const response = await api.post("/business/resources", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update resource
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/business/resources/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete resource
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/business/resources/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Upload resource images
   */
  uploadImages: async (id, formData) => {
    try {
      const response = await api.post(
        `/business/resources/${id}/images`,
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
   * Delete resource image
   */
  deleteImage: async (id, imageId) => {
    try {
      const response = await api.delete(
        `/business/resources/${id}/images/${imageId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reorder resource images
   */
  reorderImages: async (id, imageOrder) => {
    try {
      const response = await api.patch(
        `/business/resources/${id}/images/reorder`,
        {
          imageOrder,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Set primary image for resource
   */
  setPrimaryImage: async (id, imageId) => {
    try {
      const response = await api.patch(
        `/business/resources/${id}/images/primary`,
        {
          imageId,
        }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update resource status (Active/Maintenance)
   */
  updateStatus: async (id, status) => {
    try {
      // Assuming new endpoint maps to update resource with partial data
      const response = await api.put(`/business/resources/${id}`, { status });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get resource statistics
   */
  getStats: async (id) => {
    try {
      const response = await api.get(`/business/resources/${id}/stats`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get ALL resources statistics
   */
  getAllStats: async () => {
    try {
      const response = await api.get("/business/resources/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get availability (Single)
   */
  getAvailability: async (id, params = {}) => {
    try {
      const response = await api.get(`/business/resources/${id}/availability`, {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Check multiple resources availability
   */
  checkAvailability: async (params = {}) => {
    try {
      const response = await api.get("/business/resources/availability", {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get events for a resource
   */
  getEvents: async (id, params = {}) => {
    try {
      const response = await api.get(`/business/resources/${id}/events`, {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get bookings for a resource
   */
  getBookings: async (id, params = {}) => {
    try {
      const response = await api.get(`/business/resources/${id}/bookings`, {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk update resources
   */
  bulkUpdate: async (resourceIds, data) => {
    try {
      const response = await api.patch("/business/resources/bulk-update", {
        resourceIds, // Updated param name
        data,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk delete resources
   */
  bulkDelete: async (resourceIds) => {
    try {
      const response = await api.post("/business/resources/bulk-delete", {
        resourceIds,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Duplicate resource
   */
  duplicate: async (id, overrides = {}) => {
    try {
      const response = await api.post(
        `/business/resources/${id}/duplicate`,
        overrides
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export resources
   */
  export: async (filters = {}, format = "csv") => {
    try {
      const response = await api.get("/business/resources/export", {
        params: { ...filters, format },
        responseType: "blob",
      });
      return response.data; // Return blob directly for download
    } catch (error) {
      return handleError(error);
    }
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get("/business/dashboard");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

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

  getTasks: async () => {
    try {
      const response = await api.get("/tasks/my");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
