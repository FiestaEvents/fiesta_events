// src/components/common/ConfirmDialog.jsx
import React, { useEffect, useRef } from "react";
import { X, AlertTriangle, Trash2, Info, CheckCircle, AlertCircle } from "lucide-react";
import Button from "./Button";

// ============================================
// VARIANT CONFIGURATIONS
// ============================================
const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    buttonVariant: "danger",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonVariant: "warning",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonVariant: "primary",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    buttonVariant: "success",
  },
  primary: {
    icon: AlertCircle,
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    buttonVariant: "primary",
  },
};

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon: CustomIcon,
  children,
  showCancel = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const dialogRef = useRef(null);
  const config = variantConfig[variant] || variantConfig.primary;
  const IconComponent = CustomIcon || config.icon;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${config.iconBg}`}>
              <IconComponent size={28} className={config.iconColor} />
            </div>
          </div>

          {/* Title */}
          <h2
            id="dialog-title"
            className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Custom Content */}
          {children && <div className="mb-6">{children}</div>}

          {/* Actions */}
          <div className={`flex gap-3 ${showCancel ? "justify-center" : "justify-center"}`}>
            {showCancel && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 max-w-[140px]"
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              loading={loading}
              className="flex-1 max-w-[140px]"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PRESET DIALOGS
// ============================================

/**
 * Delete Confirmation Dialog
 */
export const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  loading,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Confirmation"
    message={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
    confirmText="Delete"
    variant="danger"
    loading={loading}
  />
);

/**
 * Archive Confirmation Dialog
 */
export const ArchiveDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  loading,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Archive Confirmation"
    message={`Are you sure you want to archive ${itemName}? You can restore it later.`}
    confirmText="Archive"
    variant="warning"
    loading={loading}
  />
);

/**
 * Send Confirmation Dialog
 */
export const SendDialog = ({
  isOpen,
  onClose,
  onConfirm,
  recipientName = "the recipient",
  loading,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Send Confirmation"
    message={`Send this document to ${recipientName}? They will receive an email notification.`}
    confirmText="Send"
    variant="primary"
    loading={loading}
  />
);

/**
 * Unsaved Changes Dialog
 */
export const UnsavedChangesDialog = ({
  isOpen,
  onClose,
  onConfirm,
  onDiscard,
  loading,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Unsaved Changes"
    message="You have unsaved changes. Would you like to save before leaving?"
    confirmText="Save"
    cancelText="Discard"
    variant="warning"
    loading={loading}
  >
    <div className="flex justify-center">
      <button
        onClick={onDiscard}
        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
      >
        Leave without saving
      </button>
    </div>
  </ConfirmDialog>
);

export default ConfirmDialog;