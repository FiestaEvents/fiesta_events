import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get venueId from localStorage (for multi-tenancy)
    const venueId = localStorage.getItem('venueId');
    if (venueId) {
      config.headers['X-Venue-ID'] = venueId;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // ENHANCED ERROR LOGGING
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data, // This is the key!
      message: error.message,
      requestData: error.config?.data, // See what we sent
    });

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      // Return a consistent error object with FULL error details
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        errors: data.errors || {},
        data: data, // Include full error response
      });
    } else if (error.request) {
      console.error('No response received:', error.message);
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
        errors: {},
        data: {},
      });
    } else {
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'Request failed',
        errors: {},
        data: {},
      });
    }
  }
);
export default api;