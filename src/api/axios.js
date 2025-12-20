import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 seconds
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

    // ✅ KEEP: Venue Context
    // Useful for switching venues without changing the user account
    const venueId = localStorage.getItem('venueId');
    if (venueId) {
      config.headers['X-Venue-ID'] = venueId;
    }

    // Dev Logging
    if (import.meta.env.DEV) {
      console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
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
    return response;
  },
  (error) => {
    // 1. Log Detailed Error
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    };
    
    if (import.meta.env.DEV) {
      console.error('❌ [API Error]', errorDetails);
    }

    // 2. Handle Server Responses
    if (error.response) {
      const { status, data } = error.response;

      // 🔒 GLOBAL AUTH HANDLER: Session Expired / Invalid Cookie
      if (status === 401) {
        if (!window.location.pathname.includes('/login')) {
           window.dispatchEvent(new Event("auth:session-expired"));
        }
      }

      // Return consistent error object
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        errors: data.errors || {},
        data: data,
      });
    } 
    
    // 3. Handle Network Errors (No Response)
    else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Unable to connect to server. Please check your internet connection.',
        data: {},
      });
    } 
    
    // 4. Handle Setup Errors
    else {
      return Promise.reject({
        status: 0,
        message: error.message || 'Request configuration failed',
        data: {},
      });
    }
  }
);

export default api;