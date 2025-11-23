// src/config/theme.config.js

/**
 * Fiesta Platform Theme Configuration
 * Centralized color system for consistent styling across the application
 */

export const themeColors = {
  // Brand Colors
  brand: {
    primary: '#F18237',      // Fiesta Orange
    secondary: '#374151',    // Dark Gray
    accent: '#10B981',       // Green
  },

  // Semantic Colors
  success: {
    light: '#10B981',
    DEFAULT: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#F59E0B',
    DEFAULT: '#D97706',
    dark: '#B45309',
  },
  error: {
    light: '#EF4444',
    DEFAULT: '#DC2626',
    dark: '#B91C1C',
  },
  info: {
    light: '#3B82F6',
    DEFAULT: '#2563EB',
    dark: '#1D4ED8',
  },

  // Status Colors
  status: {
    active: '#10B981',
    inactive: '#6B7280',
    pending: '#F59E0B',
    completed: '#10B981',
    cancelled: '#EF4444',
    draft: '#9CA3AF',
    sent: '#3B82F6',
    paid: '#10B981',
    partial: '#F59E0B',
    overdue: '#EF4444',
    confirmed: '#10B981',
    'in-progress': '#3B82F6',
  },

  // Neutral Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
};

/**
 * Badge Variants Configuration
 * Maps semantic names to Tailwind classes for light and dark modes
 */
export const badgeVariants = {
  primary: {
    light: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    dark: 'dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20',
  },
  secondary: {
    light: 'bg-gray-100 text-gray-700 ring-gray-500/20',
    dark: 'dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-400/20',
  },
  success: {
    light: 'bg-green-50 text-green-700 ring-green-600/20',
    dark: 'dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
  },
  warning: {
    light: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    dark: 'dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-400/20',
  },
  danger: {
    light: 'bg-red-50 text-red-700 ring-red-600/20',
    dark: 'dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20',
  },
  info: {
    light: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    dark: 'dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  },
  muted: {
    light: 'bg-gray-50 text-gray-600 ring-gray-500/10',
    dark: 'dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-400/20',
  },
  purple: {
    light: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    dark: 'dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-400/20',
  },
};

export const sizeVariants = {
  badge: {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
    xl: 'px-3.5 py-1.5 text-base',
  },
  // ... (other sizes)
};

export const statusToBadgeVariant = {
  active: 'success',
  inactive: 'muted',
  pending: 'warning',
  completed: 'success',
  cancelled: 'danger',
  draft: 'muted',
  sent: 'info',
  paid: 'success',
  partial: 'warning',
  overdue: 'danger',
  confirmed: 'success',
  'in-progress': 'info',
  todo: 'muted',
  blocked: 'danger',
  default: 'secondary',
};

// Helper function to combine variant classes
export const combineVariantClasses = (variant) => {
  if (!variant) return '';
  return `${variant.light} ${variant.dark}`;
};

// Helper function to get status badge variant
export const getStatusBadgeVariant = (status) => {
  const variant = statusToBadgeVariant[status] || statusToBadgeVariant.default;
  return variant;
};

export default {
  themeColors,
  badgeVariants,
  sizeVariants,
  combineVariantClasses,
  getStatusBadgeVariant,
};