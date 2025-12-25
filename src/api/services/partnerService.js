
// ============================================
// PARTNER SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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