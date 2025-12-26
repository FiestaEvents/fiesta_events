import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 60000, // Increased to 60s for PDF generation
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================================
// REQUEST INTERCEPTOR
// =====================================================================
api.interceptors.request.use(
  (config) => {
    // This allows switching businesses without relogging
    const businessId = localStorage.getItem('businessId');
    if (businessId) {
      config.headers['X-Business-ID'] = businessId;
    }

    // Dev Logging
    if (import.meta.env.DEV) {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// =====================================================================
// RESPONSE INTERCEPTOR
// =====================================================================
api.interceptors.response.use(
  (response) => {
    // Dev Logging
    if (import.meta.env.DEV) {
      console.log(`✅ [API] ${response.status} ${response.config.url}`);
    }
    
    // (Services can decide to use response.data or response directly for Blobs)
    return response;
  },
  async (error) => {
    // 1. Prepare Error Details
    let errorMessage = error.message || 'An error occurred';
    let errorData = {};
    const status = error.response?.status || 0;

    // 2. Handle Blob Errors (CRITICAL for PDF Downloads)
    // If a PDF download fails, the error comes as a Blob. We must convert it to JSON.
    if (
      error.response?.data instanceof Blob && 
      error.response.data.type === 'application/json'
    ) {
      try {
        const text = await error.response.data.text();
        const jsonError = JSON.parse(text);
        errorMessage = jsonError.message || errorMessage;
        errorData = jsonError;
      } catch (e) {
        // Fallback if parsing fails
        console.error("Error parsing blob error:", e);
      }
    } else if (error.response?.data) {
      // Standard JSON Error
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      errorData = error.response.data;
    }

    // 3. Log Detailed Error
    if (import.meta.env.DEV) {
      console.error('❌ [API Error]', {
        url: error.config?.url,
        status,
        message: errorMessage,
      });
    }

    // 4. Global Auth Handler (Session Expired)
    if (status === 401) {
      // Avoid infinite loops if already on login
      if (!window.location.pathname.includes('/login')) {
         window.dispatchEvent(new Event("auth:session-expired"));
      }
    }

    // 5. Return Consistent Error Object
    return Promise.reject({
      status,
      message: errorMessage,
      errors: errorData.errors || {},
      data: errorData,
      originalError: error
    });
  }
);

export default api;