// src/utils/themeUtils.js

import {
  textColors,
  bgColors,
  borderColors,
  gradients,
  shadows,
  buttonVariants,
  badgeVariants,
  statusToBadgeVariant,
} from '../config/theme.config';

/**
 * Get text color classes for a given color name
 * @param {string} color - Color name (primary, success, danger, etc.)
 * @returns {string} Tailwind classes
 */
export const getTextColor = (color) => {
  return textColors[color] || textColors.body;
};

/**
 * Get background color classes for a given color name
 * @param {string} color - Color name
 * @returns {string} Tailwind classes
 */
export const getBgColor = (color) => {
  return bgColors[color] || bgColors.card;
};

/**
 * Get border color classes for a given color name
 * @param {string} color - Color name
 * @returns {string} Tailwind classes
 */
export const getBorderColor = (color) => {
  return borderColors[color] || borderColors.secondary;
};

/**
 * Get gradient classes for a given gradient name
 * @param {string} gradient - Gradient name
 * @returns {string} Tailwind classes
 */
export const getGradient = (gradient) => {
  return gradients[gradient] || gradients.primary;
};

/**
 * Get shadow classes for a given shadow size
 * @param {string} size - Shadow size (sm, md, lg, etc.)
 * @returns {string} Tailwind classes
 */
export const getShadow = (size) => {
  return shadows[size] || shadows.sm;
};

/**
 * Combine multiple class strings, removing duplicates and empty strings
 * @param  {...string} classes - Class strings to combine
 * @returns {string} Combined classes
 */
export const cn = (...classes) => {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((value, index, self) => self.indexOf(value) === index && value !== '')
    .join(' ');
};

/**
 * Get button variant classes
 * @param {string} variant - Button variant
 * @param {boolean} includeAll - Include all states (hover, focus, disabled)
 * @returns {string} Combined button classes
 */
export const getButtonClasses = (variant = 'primary', includeAll = true) => {
  const buttonVariant = buttonVariants[variant] || buttonVariants.primary;
  
  if (!includeAll) {
    return buttonVariant.base;
  }
  
  return cn(
    buttonVariant.base,
    buttonVariant.hover,
    buttonVariant.focus,
    buttonVariant.disabled,
    buttonVariant.dark || ''
  );
};

/**
 * Get badge variant classes
 * @param {string} variant - Badge variant
 * @returns {string} Combined badge classes
 */
export const getBadgeClasses = (variant = 'primary') => {
  const badgeVariant = badgeVariants[variant] || badgeVariants.primary;
  return cn(badgeVariant.light, badgeVariant.dark);
};

/**
 * Map status value to badge variant
 * @param {string} status - Status value
 * @returns {string} Badge variant name
 */
export const getStatusVariant = (status) => {
  if (!status) return 'secondary';
  
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  return statusToBadgeVariant[normalizedStatus] || 'secondary';
};

/**
 * Get color classes for a given semantic color name
 * Useful for creating consistent colored containers, cards, etc.
 * @param {string} color - Color name (primary, success, danger, etc.)
 * @returns {object} Object with text, bg, border, and ring classes
 */
export const getColorClasses = (color) => {
  const colorMap = {
    primary: {
      text: 'text-orange-700 dark:text-orange-300',
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      border: 'border-orange-200 dark:border-orange-800',
      ring: 'ring-orange-600/20 dark:ring-orange-400/20',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-500/20',
    },
    success: {
      text: 'text-green-700 dark:text-green-300',
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-200 dark:border-green-800',
      ring: 'ring-green-600/20 dark:ring-green-400/20',
      hover: 'hover:bg-green-100 dark:hover:bg-green-500/20',
    },
    warning: {
      text: 'text-yellow-700 dark:text-yellow-300',
      bg: 'bg-yellow-50 dark:bg-yellow-500/10',
      border: 'border-yellow-200 dark:border-yellow-800',
      ring: 'ring-yellow-600/20 dark:ring-yellow-400/20',
      hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-500/20',
    },
    danger: {
      text: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-800',
      ring: 'ring-red-600/20 dark:ring-red-400/20',
      hover: 'hover:bg-red-100 dark:hover:bg-red-500/20',
    },
    info: {
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-800',
      ring: 'ring-blue-600/20 dark:ring-blue-400/20',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-500/20',
    },
    muted: {
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-500/10',
      border: 'border-gray-200 dark:border-gray-700',
      ring: 'ring-gray-500/10 dark:ring-gray-400/20',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-500/20',
    },
  };

  return colorMap[color] || colorMap.muted;
};

/**
 * Get icon color classes based on variant
 * @param {string} variant - Color variant
 * @param {string} size - Icon size (xs, sm, md, lg, xl)
 * @returns {string} Icon classes
 */
export const getIconClasses = (variant = 'primary', size = 'md') => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'text-orange-600 dark:text-orange-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    muted: 'text-gray-500 dark:text-gray-400',
  };

  return cn(sizeClasses[size] || sizeClasses.md, colorClasses[variant] || colorClasses.muted);
};

/**
 * Create a CSS class string for a card with variant styling
 * @param {string} variant - Card variant
 * @param {boolean} hoverable - Whether the card should have hover effects
 * @param {boolean} clickable - Whether the card should have click cursor
 * @returns {string} Card classes
 */
export const getCardClasses = (variant = 'default', hoverable = false, clickable = false) => {
  const baseClasses = 'rounded-lg border shadow-sm transition-all';
  const variantClasses = getColorClasses(variant);
  
  const interactiveClasses = cn(
    hoverable ? 'hover:shadow-md' : '',
    clickable ? 'cursor-pointer' : ''
  );

  if (variant === 'default') {
    return cn(
      baseClasses,
      'bg-white dark:bg-gray-800',
      'border-gray-200 dark:border-gray-700',
      interactiveClasses
    );
  }

  return cn(
    baseClasses,
    variantClasses.bg,
    variantClasses.border,
    interactiveClasses
  );
};

/**
 * Get alert/notification classes based on variant
 * @param {string} variant - Alert variant
 * @returns {object} Alert classes
 */
export const getAlertClasses = (variant = 'info') => {
  const colors = getColorClasses(variant);
  
  return {
    container: cn(colors.bg, colors.border, 'border rounded-lg p-4'),
    icon: cn(colors.text, 'w-5 h-5 flex-shrink-0'),
    title: cn(colors.text, 'font-medium'),
    description: cn(colors.text, 'text-sm opacity-90'),
  };
};

/**
 * Generate loading skeleton classes
 * @param {string} variant - Skeleton variant (pulse, wave)
 * @returns {string} Skeleton classes
 */
export const getSkeletonClasses = (variant = 'pulse') => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 rounded';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
  };

  return cn(baseClasses, animationClasses[variant] || animationClasses.pulse);
};

/**
 * Get input/form field classes with variant support
 * @param {string} variant - Input variant (default, error, success)
 * @param {boolean} disabled - Whether the input is disabled
 * @returns {string} Input classes
 */
export const getInputClasses = (variant = 'default', disabled = false) => {
  const baseClasses = cn(
    'block w-full rounded-md shadow-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'dark:bg-gray-800 dark:text-white'
  );

  const variantClasses = {
    default: 'border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500',
    error: 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
    : '';

  return cn(baseClasses, variantClasses[variant] || variantClasses.default, disabledClasses);
};

/**
 * Generate consistent spacing classes
 * @param {string} size - Spacing size (xs, sm, md, lg, xl)
 * @returns {object} Spacing classes for different use cases
 */
export const getSpacingClasses = (size = 'md') => {
  const spacingMap = {
    xs: { padding: 'p-2', margin: 'm-2', gap: 'gap-2' },
    sm: { padding: 'p-3', margin: 'm-3', gap: 'gap-3' },
    md: { padding: 'p-4', margin: 'm-4', gap: 'gap-4' },
    lg: { padding: 'p-6', margin: 'm-6', gap: 'gap-6' },
    xl: { padding: 'p-8', margin: 'm-8', gap: 'gap-8' },
  };

  return spacingMap[size] || spacingMap.md;
};

export default {
  getTextColor,
  getBgColor,
  getBorderColor,
  getGradient,
  getShadow,
  cn,
  getButtonClasses,
  getBadgeClasses,
  getStatusVariant,
  getColorClasses,
  getIconClasses,
  getCardClasses,
  getAlertClasses,
  getSkeletonClasses,
  getInputClasses,
  getSpacingClasses,
};