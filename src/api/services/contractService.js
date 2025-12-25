
// ============================================
// CONTRACT SERVICE
// ============================================

import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";

export const contractService = {

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  getAll: async (params = {}) => {
    const response = await api.get("/contracts", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/contracts", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },

  // ============================================
  // ARCHIVE OPERATIONS
  // ============================================

  archive: async (id) => {
    const response = await api.patch(`/contracts/${id}/archive`);
    return response.data;
  },

  restore: async (id) => {
    const response = await api.patch(`/contracts/${id}/restore`);
    return response.data;
  },

  // ============================================
  // WORKFLOW & ACTIONS
  // ============================================

  send: async (id) => {
    const response = await api.post(`/contracts/${id}/send`);
    return response.data;
  },

  markViewed: async (id) => {
    const response = await api.patch(`/contracts/${id}/view`);
    return response.data;
  },

  sign: async (id, signatureData) => {
    const response = await api.post(`/contracts/${id}/sign`, signatureData);
    return response.data;
  },

  duplicate: async (id) => {
    const response = await api.post(`/contracts/${id}/duplicate`);
    return response.data;
  },

  /**
   * Download PDF
   * Endpoint: GET /api/contracts/:id/download
   * Note: We use responseType: 'blob' to handle binary file data
   */
  download: async (id) => {
    const response = await api.get(`/contracts/${id}/download`, {
      responseType: 'blob' 
    });
    return response.data;
  },

  // ============================================
  // SETTINGS & CONFIG
  // ============================================

  getSettings: async () => {
  const response = await api.get("/contracts/settings");
  return response.data;
  },

  updateSettings: async (data) => {
  // Use longer timeout for settings update (large payload)
  const response = await api.put("/contracts/settings", data, {
    timeout: 60000, // 60 seconds timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
},

// ============================================
// ALTERNATIVE: Split into smaller updates
// ============================================

// If the above still times out, use these granular update methods:

updateCompanyInfo: async (companyInfo) => {
  const response = await api.patch("/contracts/settings/company", { companyInfo });
  return response.data;
},

updateBranding: async (branding) => {
  const response = await api.patch("/contracts/settings/branding", { branding });
  return response.data;
},

updateFinancials: async (financialDefaults) => {
  const response = await api.patch("/contracts/settings/financials", { financialDefaults });
  return response.data;
},

updateSections: async (defaultSections) => {
  const response = await api.patch("/contracts/settings/sections", { defaultSections });
  return response.data;
},

updateCancellationPolicy: async (defaultCancellationPolicy) => {
  const response = await api.patch("/contracts/settings/cancellation", { defaultCancellationPolicy });
  return response.data;
},

updateLabels: async (labels) => {
  const response = await api.patch("/contracts/settings/labels", { labels });
  return response.data;
},

updateStructure: async (structure) => {
  const response = await api.patch("/contracts/settings/structure", { structure });
  return response.data;
},
  // ============================================
  // STATISTICS
  // ============================================

  getStats: async () => {
    const response = await api.get("/contracts/stats");
    return response.data;
  },

  // ============================================
  // HELPERS
  // ============================================

  getByEvent: async (eventId) => {
    const response = await api.get("/contracts", { params: { event: eventId } });
    return response.data;
  },

  getByClient: async (clientId) => {
    const response = await api.get("/contracts", { params: { client: clientId } });
    return response.data;
  },

  getByPartner: async (partnerId) => {
    const response = await api.get("/contracts", { params: { partner: partnerId } });
    return response.data;
  },

  getPending: async () => {
    const response = await api.get("/contracts", {
      params: { status: "sent,viewed" },
    });
    return response.data;
  },

  getExpiring: async (days = 30) => {
    const response = await api.get("/contracts", {
      params: { expiringSoon: days },
    });
    return response.data;
  },
};