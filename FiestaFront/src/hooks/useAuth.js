import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    loading, 
    login, 
    logout, 
    register,
    hasPermission 
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    hasPermission,
  };
};