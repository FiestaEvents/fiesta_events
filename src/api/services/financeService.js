import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const financeService = {
  /**
   * Get all finance records with pagination and filters
   */
  getFinanceRecords: async (params = {}) => {
    try {
      const response = await api.get("/finance", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single record
   */
  getFinanceRecord: async (id) => {
    try {
      const response = await api.get(`/finance/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create record
   */
  createFinanceRecord: async (data) => {
    try {
      const response = await api.post("/finance", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update record
   */
  updateFinanceRecord: async (id, data) => {
    try {
      const response = await api.put(`/finance/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete record (archive)
   */
  deleteFinanceRecord: async (id) => {
    try {
      const response = await api.delete(`/finance/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ANALYTICS & REPORTS
  // ============================================

  /**
   * Get Financial Summary (Income, Expense, Profit)
   */
  getSummary: async (params = {}) => {
    try {
      const response = await api.get("/finance/summary", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Cash Flow Report (Timeline)
   */
  getCashFlowReport: async (params = {}) => {
    try {
      const response = await api.get("/finance/cashflow", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Expense Breakdown by Category
   */
  getExpenseBreakdown: async (params = {}) => {
    try {
      const response = await api.get("/finance/expenses/breakdown", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Income Breakdown by Category
   */
  getIncomeBreakdown: async (params = {}) => {
    try {
      const response = await api.get("/finance/income/breakdown", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Financial Trends (Area Chart Data)
   */
  getFinancialTrends: async (params = {}) => {
    try {
      const response = await api.get("/finance/trends", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Profit & Loss Statement
   */
  getProfitLoss: async (params = {}) => {
    try {
      const response = await api.get("/finance/profit-loss", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get Tax Summary
   */
  getTaxSummary: async (params = {}) => {
    try {
      const response = await api.get("/finance/tax-summary", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
