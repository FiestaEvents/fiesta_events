import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const paymentService = {
  /**
   * Get all payments (Aliases: getPayments / getAll)
   */
  getPayments: async (params = {}) => {
    try {
      const response = await api.get("/payments", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Alias for backward compatibility
  getAll: async (params = {}) => {
    return paymentService.getPayments(params);
  },

  /**
   * Get single payment by ID
   */
  getPayment: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Alias
  getById: async (id) => {
    return paymentService.getPayment(id);
  },

  /**
   * Create new payment
   */
  createPayment: async (data) => {
    try {
      const response = await api.post("/payments", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Alias
  create: async (data) => {
    return paymentService.createPayment(data);
  },

  /**
   * Update payment
   */
  updatePayment: async (id, data) => {
    try {
      const response = await api.put(`/payments/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Alias
  update: async (id, data) => {
    return paymentService.updatePayment(id, data);
  },

  /**
   * Delete (archive) payment
   */
  deletePayment: async (id) => {
    try {
      const response = await api.delete(`/payments/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Alias
  delete: async (id) => {
    return paymentService.deletePayment(id);
  },

  /**
   * Process Refund
   */
  processRefund: async (id, data) => {
    try {
      const response = await api.post(`/payments/${id}/refund`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Payment Stats
   */
  getPaymentStats: async (params = {}) => {
    try {
      const response = await api.get("/payments/stats", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
