// src/hooks/useToast.js
import { useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

// Custom hook with convenience methods
export const useToast = () => {
  const { showNotification, hideNotification, clearAll } = useNotification();

  const toast = useCallback((message, type = 'info', duration = 5000) => {
    return showNotification(message, type, duration);
  }, [showNotification]);

  const success = useCallback((message, duration = 5000) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const error = useCallback((message, duration = 5000) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const warning = useCallback((message, duration = 5000) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const info = useCallback((message, duration = 5000) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  const loading = useCallback((message) => {
    return showNotification(message, 'info', Infinity); // Infinite duration for loading
  }, [showNotification]);

  const dismiss = useCallback((id) => {
    hideNotification(id);
  }, [hideNotification]);

  const promise = useCallback(async (promise, messages) => {
    const { 
      loading = 'Loading...',
      success = 'Operation completed successfully!',
      error = 'Something went wrong!' 
    } = messages || {};

    const loadingId = showNotification(loading, 'info', Infinity);

    try {
      const result = await promise;
      hideNotification(loadingId);
      showNotification(success, 'success');
      return result;
    } catch (err) {
      hideNotification(loadingId);
      const errorMessage = err.message || error;
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [showNotification, hideNotification]);

  return {
    // Basic methods
    toast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    clearAll,
    
    // Advanced methods
    promise,
    
    // Aliases for convenience
    show: toast,
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
    showLoading: loading,
  };
};

export default useToast;