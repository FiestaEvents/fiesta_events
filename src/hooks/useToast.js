// src/hooks/useToast.js
import { useCallback } from 'react';
import { useToast as useToastContext } from '../context/ToastContext';

// Custom hook with convenience methods
export const useToast = () => {
  const { 
    showToast, 
    dismiss, 
    clearAll, 
    success, 
    error, 
    warning, 
    info, 
    loading, 
    promise,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  } = useToastContext();

  // Extended methods for common use cases
  const apiError = useCallback((error, defaultMessage = 'An error occurred') => {
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    return showError(message);
  }, [showError]);

  const formSuccess = useCallback((action = 'saved') => {
    return showSuccess(`Form ${action} successfully!`);
  }, [showSuccess]);

  const formError = useCallback((action = 'save') => {
    return showError(`Failed to ${action} form. Please try again.`);
  }, [showError]);

  const deleteSuccess = useCallback((item = 'item') => {
    return showSuccess(`${item} deleted successfully`);
  }, [showSuccess]);

  const deleteError = useCallback((item = 'item') => {
    return showError(`Failed to delete ${item}. Please try again.`);
  }, [showError]);

  const archiveSuccess = useCallback((item = 'item') => {
    return showSuccess(`${item} archived successfully`);
  }, [showSuccess]);

  const archiveError = useCallback((item = 'item') => {
    return showError(`Failed to archive ${item}. Please try again.`);
  }, [showError]);

  const restoreSuccess = useCallback((item = 'item') => {
    return showSuccess(`${item} restored successfully`);
  }, [showSuccess]);

  const restoreError = useCallback((item = 'item') => {
    return showError(`Failed to restore ${item}. Please try again.`);
  }, [showError]);

  const networkError = useCallback(() => {
    return showError('Network error. Please check your connection and try again.');
  }, [showError]);

  const permissionError = useCallback(() => {
    return showError('You do not have permission to perform this action.');
  }, [showError]);

  const validationError = useCallback((field = '') => {
    const message = field ? `Please check the ${field} field.` : 'Please check the form for errors.';
    return showError(message);
  }, [showError]);

  const fileUploadSuccess = useCallback((fileType = 'file') => {
    return showSuccess(`${fileType} uploaded successfully`);
  }, [showSuccess]);

  const fileUploadError = useCallback((fileType = 'file') => {
    return showError(`Failed to upload ${fileType}. Please try again.`);
  }, [showError]);

  const bulkActionSuccess = useCallback((action, count) => {
    return showSuccess(`${count} items ${action} successfully`);
  }, [showSuccess]);

  const bulkActionError = useCallback((action) => {
    return showError(`Failed to ${action} items. Please try again.`);
  }, [showError]);

  // Alias for showToast for backward compatibility
  const toast = useCallback((message, type = 'info', duration = 5000) => {
    return showToast(message, type, duration);
  }, [showToast]);

  // Alias for dismiss for backward compatibility
  const hideNotification = useCallback((id) => {
    dismiss(id);
  }, [dismiss]);

  return {
    // ========================
    // BASIC METHODS
    // ========================
    
    // Core toast methods
    showToast,
    dismiss,
    clearAll,
    
    // Type-specific methods
    success,
    error,
    warning,
    info,
    loading,
    
    // Promise support
    promise,
    
    // ========================
    // ALIASES FOR CONVENIENCE
    // ========================
    toast,
    show: showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideNotification, // Backward compatibility alias

    // ========================
    // EXTENDED CONVENIENCE METHODS
    // ========================
    
    // Error handling
    apiError,
    networkError,
    permissionError,
    validationError,
    
    // Form operations
    formSuccess,
    formError,
    
    // CRUD operations
    deleteSuccess,
    deleteError,
    archiveSuccess,
    archiveError,
    restoreSuccess,
    restoreError,
    
    // File operations
    fileUploadSuccess,
    fileUploadError,
    
    // Bulk operations
    bulkActionSuccess,
    bulkActionError,
  };
};

export default useToast;