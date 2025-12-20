import { create } from 'zustand';
import { authService } from '../api/index'; 

const useAuthStore = create((set, get) => ({
  // Optimistically load user for UI stability, but verify immediately
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  loading: true, // Start in loading state to verify session
  error: null,

  // ✅ ACTION: Login (Cookie handled by Backend)
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials.email, credentials.password);
      
      // Backend returns { user: {...}, ... } - Token is in HttpOnly Cookie
      const userData = response.data?.user || response.user || response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        loading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        loading: false 
      });
      throw error;
    }
  },

  // ✅ ACTION: Register (Cookie handled by Backend)
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(data);
      const userData = response.data?.user || response.user || response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        loading: false,
        error: null
      });
      
      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        loading: false 
      });
      throw error;
    }
  },

  // ✅ ACTION: Logout
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout(); // Clears HttpOnly Cookie
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('venueId');
      
      set({ 
        user: null, 
        isAuthenticated: false,
        loading: false 
      });
      
      // Hard refresh to clear any in-memory sensitive states
      window.location.href = "/login"; 
    }
  },

  // ✅ ACTION: Update User (Profile changes)
  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  // ✅ ACTION: Verify Session (Called on App Mount)
  checkAuth: async () => {
    set({ loading: true });
    try {
      // Calls /me endpoint. If cookie exists, returns user.
      const response = await authService.getMe();
      const userData = response.data?.user || response.user || response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
    } catch (error) {
      // 401/403 means invalid/expired cookie
      localStorage.removeItem('user');
      localStorage.removeItem('venueId');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  // ✅ ACTION: Check Permission
  hasPermission: (permissionName) => {
    const { user } = get();
    if (!user) return false;

    // 1. Owner Override (Always allow)
    if (user.role?.name === 'Owner' || user.role?.type === 'owner') {
      return true;
    }

    // 2. Check Permissions List (Array of Strings)
    // Backend now returns ['events.create', 'events.read.all', ...]
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permissionName);
    }

    return false;
  },
}));

export default useAuthStore;