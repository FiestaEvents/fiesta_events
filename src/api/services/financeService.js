
// ============================================
// FINANCE SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const financeService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/finance", { params });
      // Backend returns: { records, pagination }
      return {
        finance: response.data?.data?.records || [],
        pagination: response.data?.data?.pagination || {},
      };
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/finance/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/finance", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/finance/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/finance/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getSummary: async (params = {}) => {
    try {
      const response = await api.get("/finance/summary", { params });
      // Backend returns: { summary, categoryBreakdown, timeSeries, topExpenses, topIncome }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getCashflow: async (params = {}) => {
    try {
      const response = await api.get("/finance/cashflow", { params });
      // Backend returns: { cashFlow: array, currentBalance }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getExpensesBreakdown: async (params = {}) => {
    try {
      const response = await api.get("/finance/expenses/breakdown", { params });
      // Backend returns: { breakdown, totalExpenses }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getIncomeBreakdown: async (params = {}) => {
    try {
      const response = await api.get("/finance/income/breakdown", { params });
      // Backend returns: { breakdown, totalIncome }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getProfitLoss: async (params = {}) => {
    try {
      const response = await api.get("/finance/profit-loss", { params });
      // Backend returns: { revenue, expenses, profitability }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getTrends: async (params = {}) => {
    try {
      const response = await api.get("/finance/trends", { params });
      // Backend returns: { trends: array }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },

  getTaxSummary: async (params = {}) => {
    try {
      const response = await api.get("/finance/tax-summary", { params });
      // Backend returns: { year, totalIncome, totalExpense, taxableIncome, totalTaxPaid, taxRecords }
      return response.data?.data || {};
    } catch (error) {
      return handleError(error);
    }
  },
};