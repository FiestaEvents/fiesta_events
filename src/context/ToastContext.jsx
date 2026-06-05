import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

// Toast Component
const Toast = ({ toast, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  React.useEffect(() => {
    if (toast.duration > 0 && toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => onClose(toast.id), 300);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    loading: <Loader2 className="w-5 h-5 animate-spin" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    loading: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300',
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full mb-2 transition-all duration-300
        ${styles[toast.type]}
        ${isLeaving ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      {toast.type !== 'loading' && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

// Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  // Basic methods
  const success = useCallback((message, duration = 5000) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration = 5000) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration = 5000) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration = 5000) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const loading = useCallback((message) => {
    return showToast(message, 'loading', Infinity);
  }, [showToast]);

  const dismiss = useCallback((id) => {
    removeToast(id);
  }, [removeToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const promise = useCallback(async (promise, messages) => {
    const { 
      loading: loadingMsg = 'Loading...',
      success: successMsg = 'Operation completed successfully!',
      error: errorMsg = 'Something went wrong!' 
    } = messages || {};

    const loadingId = showToast(loadingMsg, 'loading', Infinity);

    try {
      const result = await promise;
      removeToast(loadingId);
      showToast(successMsg, 'success');
      return result;
    } catch (err) {
      removeToast(loadingId);
      const errorMessage = err.message || errorMsg;
      showToast(errorMessage, 'error');
      throw err;
    }
  }, [showToast, removeToast]);

  const value = {
    // Basic methods
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
    
    // Aliases for convenience
    toast: showToast,
    show: showToast,
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
    showLoading: loading,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastContext;