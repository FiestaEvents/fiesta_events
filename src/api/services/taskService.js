// ============================================
// TASK SERVICE
// ============================================
import api from "../axios";
import { handleResponse, handleError } from "../../utils/apiUtils";


export const taskService = {
  /**
   * Get all tasks with filtering and pagination
   * @param {Object} params - Filter parameters (page, limit, status, priority, etc.)
   * @returns {Promise<{ tasks: Array, pagination: Object }>}
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/tasks", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get single task by ID
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create new task
   * @param {Object} data - Task data
   * @returns {Promise<{ task: Object }>}
   */
  create: async (data) => {
    try {
      const response = await api.post("/tasks", data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update task
   * @param {string} id - Task ID
   * @param {Object} data - Fields to update
   * @returns {Promise<{ task: Object }>}
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete task
   * @param {string} id - Task ID
   * @returns {Promise<{ success: boolean }>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // STATUS & ASSIGNMENT
  // ============================================

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - New status
   * @returns {Promise<{ task: Object }>}
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Complete a task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  complete: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/complete`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Assign task to a user
   * @param {string} id - Task ID
   * @param {string} userId - User ID to assign to
   * @returns {Promise<{ task: Object }>}
   */
  assign: async (id, userId) => {
    try {
      const response = await api.patch(`/tasks/${id}/assign`, { userId });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Unassign task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  unassign: async (id) => {
    try {
      const response = await api.patch(`/tasks/${id}/unassign`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // SUBTASKS
  // ============================================

  /**
   * Add subtask
   * @param {string} id - Task ID
   * @param {Object} subtask - Subtask data { title }
   * @returns {Promise<{ task: Object, subtask: Object }>}
   */
  addSubtask: async (id, subtask) => {
    try {
      const response = await api.post(`/tasks/${id}/subtasks`, subtask);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update subtask
   * @param {string} id - Task ID
   * @param {string} subtaskId - Subtask ID
   * @param {Object} data - Updated subtask data
   * @returns {Promise<{ task: Object }>}
   */
  updateSubtask: async (id, subtaskId, data) => {
    try {
      const response = await api.put(
        `/tasks/${id}/subtasks/${subtaskId}`,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Toggle subtask completion
   * @param {string} id - Task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<{ task: Object }>}
   */
  toggleSubtask: async (id, subtaskId) => {
    try {
      const response = await api.patch(
        `/tasks/${id}/subtasks/${subtaskId}/toggle`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete subtask
   * @param {string} id - Task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<{ task: Object }>}
   */
  deleteSubtask: async (id, subtaskId) => {
    try {
      const response = await api.delete(`/tasks/${id}/subtasks/${subtaskId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reorder subtasks
   * @param {string} id - Task ID
   * @param {Array<{id: string, order: number}>} subtasks - Array of subtask IDs with new order
   * @returns {Promise<{ task: Object }>}
   */
  reorderSubtasks: async (id, subtasks) => {
    try {
      const response = await api.patch(`/tasks/${id}/subtasks/reorder`, {
        subtasks,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // TAGS
  // ============================================

  /**
   * Add tags to task
   * @param {string} id - Task ID
   * @param {Array<string>} tags - Tags to add
   * @returns {Promise<{ task: Object }>}
   */
  addTags: async (id, tags) => {
    try {
      const response = await api.post(`/tasks/${id}/tags`, { tags });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Remove tags from task
   * @param {string} id - Task ID
   * @param {Array<string>} tags - Tags to remove
   * @returns {Promise<{ task: Object }>}
   */
  removeTags: async (id, tags) => {
    try {
      const response = await api.delete(`/tasks/${id}/tags`, {
        data: { tags },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // ARCHIVE & RESTORE
  // ============================================

  /**
   * Archive task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  archive: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/archive`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Unarchive/restore task
   * @param {string} id - Task ID
   * @returns {Promise<{ task: Object }>}
   */
  unarchive: async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/unarchive`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get archived tasks
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ tasks: Array, pagination: Object }>}
   */
  getArchived: async (params = {}) => {
    try {
      const response = await api.get("/tasks/archived", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // VIEWS & FILTERS
  // ============================================

  /**
   * Get task board view (Kanban style)
   * @param {Object} filters - Additional filters
   * @returns {Promise<{ board: Object }>}
   */
  getBoard: async (filters = {}) => {
    try {
      const response = await api.get("/tasks/board", { params: filters });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get my tasks (assigned to current user)
   * @param {Object} params - Filter parameters
   * @returns {Promise<{ tasks: Object }>}
   */
  getMyTasks: async (params = {}) => {
    try {
      const response = await api.get("/tasks/my", { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get overdue tasks
   * @returns {Promise<{ tasks: Array, count: number }>}
   */
  getOverdue: async () => {
    try {
      const response = await api.get("/tasks/overdue");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get tasks due today
   * @returns {Promise<{ tasks: Array, count: number }>}
   */
  getDueToday: async () => {
    try {
      const response = await api.get("/tasks/due-today");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get upcoming tasks (due within specified days)
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<{ tasks: Array, count: number }>}
   */
  getUpcoming: async (days = 7) => {
    try {
      const response = await api.get("/tasks/upcoming", { params: { days } });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search tasks (Full text search on title/description)
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<{ tasks: Array, count: number }>}
   */
  search: async (query, filters = {}) => {
    try {
      const response = await api.get("/tasks/search", {
        params: { q: query, ...filters },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get general task statistics
   * @returns {Promise<{ stats: Object }>}
   */
  getStats: async () => {
    try {
      const response = await api.get("/tasks/stats");
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Bulk update tasks
   * @param {Array<string>} ids - Array of task IDs
   * @param {Object} data - Fields to update
   * @returns {Promise<{ updated: number }>}
   */
  bulkUpdate: async (ids, data) => {
    try {
      const response = await api.patch("/tasks/bulk-update", { ids, data });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk delete tasks
   * @param {Array<string>} ids - Array of task IDs
   * @returns {Promise<{ deleted: number }>}
   */
  bulkDelete: async (ids) => {
    try {
      const response = await api.post("/tasks/bulk-delete", { ids });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Duplicate/clone a task
   * @param {string} id - Task ID to duplicate
   * @param {Object} overrides - Fields to override
   * @returns {Promise<{ task: Object }>}
   */
  duplicate: async (id, overrides = {}) => {
    try {
      const response = await api.post(`/tasks/${id}/duplicate`, overrides);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export tasks to CSV/Excel
   * @param {Object} filters - Filter parameters
   * @param {string} format - Export format
   * @returns {Promise<Blob>}
   */
  export: async (filters = {}, format = "csv") => {
    try {
      const response = await api.get("/tasks/export", {
        params: { ...filters, format },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};