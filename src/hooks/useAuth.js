import useAuthStore from '../store/authStore';
import { useEffect } from 'react';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error,
    login, 
    logout, 
    register,
    updateUser,
    checkAuth,
    hasPermission 
  } = useAuthStore();

  // Optional: Auto-check auth on hook mount if needed globally
  // Usually better to do this once in App.jsx or MainLayout
  /*
  useEffect(() => {
    // Only check if we haven't verified yet and aren't currently loading
    if (!user && !loading) {
       checkAuth();
    }
  }, []);
  */

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    updateUser,
    checkAuth,
    hasPermission,
  };
};