
// ============================================
// INVOICE SERVICE
// ============================================

import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const invoiceService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/invoices", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/invoices", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/invoices/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  send: async (id, data = {}) => {
    try {
      const response = await api.post(`/invoices/${id}/send`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  markAsPaid: async (id, data = {}) => {
    try {
      const response = await api.post(`/invoices/${id}/mark-paid`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  cancel: async (id, reason = "") => {
    try {
      const response = await api.post(`/invoices/${id}/cancel`, { reason });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

   download: async (id, language = "fr") => {
    try {
      const response = await api.get(`/invoices/${id}/download`, {
        params: { language },
        responseType: "arraybuffer", // ✅ CRITICAL: Prevents data corruption
        headers: { Accept: "application/pdf" },
      });

      // Check if the response is actually JSON (Error) instead of PDF
      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("application/json")) {
        // Decode the array buffer to string to parse the error
        const text = new TextDecoder().decode(response.data);
        const json = JSON.parse(text);
        throw new Error(json.message || "Download failed");
      }

      // Create Blob from ArrayBuffer
      const blob = new Blob([response.data], { type: "application/pdf" });
      return blob;

    } catch (error) {
      console.error("Download service error:", error);
      throw error;
    }
  },

  getStats: async (params = {}) => {
    try {
      const response = await api.get("/invoices/stats", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // INVOICE SETTINGS & CUSTOMIZATION
  // ============================================

  getSettings: async () => {
    try {
      const response = await api.get("/invoices/settings");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  updateSettings: async (data) => {
    try {
      const response = await api.put("/invoices/settings", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  //  Upload Logo Logic
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append("image", file); 

    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return handleResponse(response); 
    } catch (error) {
      return handleError(error);
    }
  },

  applyTemplate: async (template) => {
    try {
      const response = await api.post("/invoices/settings/apply-template", {
        template,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  resetSettings: async () => {
    try {
      const response = await api.post("/invoices/settings/reset");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  preview: async (invoiceData) => {
    try {
      const response = await api.post("/invoices/settings/preview", {
        invoiceData,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};