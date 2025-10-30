//axios.js
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
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('venueId');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - User doesn't have permission
          console.error('Access forbidden:', data.message);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;

        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;

        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;

        default:
          console.error('API Error:', data.message || 'Unknown error occurred');
      }

      // Return a consistent error object
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || {},
        data: data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.message);
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
        errors: {},
        data: {},
      });
    } else {
      // Something happened in setting up the request
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