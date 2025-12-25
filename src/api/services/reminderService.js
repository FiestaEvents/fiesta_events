// ============================================
// REMINDER SERVICE 
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";


  export const reminderService = {
  // ==========================================
  // CRUD Operations
  // ==========================================
  
  getAll: async (params = {}) => {
    const response = await api.get('/reminders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reminders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/reminders', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/reminders/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },

  // ==========================================
  // Special Actions
  // ==========================================
  
  toggleComplete: async (id) => {
    const response = await api.patch(`/reminders/${id}/toggle-complete`);
    return response.data;
  },

  snooze: async (id, minutes = 15) => {
    const response = await api.post(`/reminders/${id}/snooze`, { minutes });
    return response.data;
  },

  dismiss: async (id) => {
    const response = await api.post(`/reminders/${id}/dismiss`);
    return response.data;
  },

  // ==========================================
  // Stats & Upcoming (with AbortController support)
  // ==========================================
  
  getStats: async (signal) => {
    const response = await api.get('/reminders/stats', { signal });
    return response.data;
  },

  getUpcoming: async ({ hours = 168, signal } = {}) => {
    try {
      const response = await api.get('/reminders/upcoming', {
        params: { hours },
        signal, // ✅ Pass AbortController signal
      });
      return response.data;
    } catch (error) {
      // ✅ Handle abort gracefully
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        return { aborted: true };
      }
      throw error;
    }
  },
};