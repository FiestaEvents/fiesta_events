
// ============================================
// TEAM SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

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

  acceptInvitation: async (data) => {
    // data = { token, name, password }
    const response = await api.post(`/team/invitations/accept`, data);
    return handleResponse(response);
  },

  // Ensure these exist:
  invite: async (data) => {
    // data = { email, roleId }
    const response = await api.post(`/team/invite`, data);
    return handleResponse(response);
  },

  getInvitations: async () => {
    const response = await api.get(`/team/invitations`);
    return handleResponse(response);
  },

  revokeInvitation: async (id) => {
    const response = await api.delete(`/team/invitations/${id}`);
    return handleResponse(response);
  },
  
  resendInvitation: async (id) => {
    const response = await api.post(`/team/invitations/${id}/resend`);
    return handleResponse(response);
  },
  validateInvitation: async (token) => {
    // Passes token as a query parameter
    const response = await api.get(`/team/invitations/validate?token=${token}`);
    return handleResponse(response);
  },
  getActivity: async (id) => {
  const response = await api.get(`/users/${id}/activity`);
  return handleResponse(response);
  },

};