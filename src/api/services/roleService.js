// ============================================
// ROLE SERVICE
// ============================================

import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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