// ============================================
// PORTFOLIO SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const portfolioService = {
  /**
   * Get all projects with optional filters (category, search, pagination)
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/portfolio", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get a single project by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/portfolio/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create a new project
   */
  create: async (data) => {
    try {
      const response = await api.post("/portfolio", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update an existing project
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/portfolio/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete a project
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/portfolio/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
 uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; 
  }
};