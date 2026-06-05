// ============================================
// API UTILITY FUNCTIONS
// ============================================
// Normalizes API responses and handles errors consistently

/**
 * Handles successful API responses.
 * @param {Object} response - Axios or fetch response object.
 * @returns {any} - The normalized response data.
 */
export const handleResponse = (response) => {
  return response?.data?.data || response?.data || response;
};

/**
 * Handles API errors by throwing them for higher-level handling.
 * @param {Error} error - The error object from a failed request.
 * @throws {Error} - The original error.
 */
export const handleError = (error) => {
  throw error;
};
