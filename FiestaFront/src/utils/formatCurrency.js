// src/utils/formatCurrency.js

/**
 * Formats a number as currency with the currency symbol after the amount.
 * Automatically uses compact format for large numbers (>= 100,000).
 * @param {number} amount - The numeric amount to format
 * @param {string} [locale='tn-TN'] - Optional locale string
 * @param {string} [currency='TND'] - Optional currency code
 * @param {Object} [options] - Additional options
 * @param {number} [options.compactThreshold=100000] - Threshold for compact format
 * @param {boolean} [options.forceCompact=false] - Force compact format regardless of amount
 * @param {boolean} [options.forceRegular=false] - Force regular format regardless of amount
 * @returns {string} - Formatted currency string with symbol after amount
 */
export const formatCurrency = (
  amount,
  locale = "tn-TN",
  currency = "TND",
  options = {}
) => {
  if (typeof amount !== "number") return "";

  const {
    compactThreshold = 100000,
    forceCompact = false,
    forceRegular = false,
  } = options;

  // Get the currency symbol
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });

  const parts = currencyFormatter.formatToParts(1);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || currency;

  // Determine if we should use compact format
  const useCompact =
    forceCompact || (!forceRegular && Math.abs(amount) >= compactThreshold);

  if (useCompact) {
    // Use compact notation for large numbers
    const formattedNumber = new Intl.NumberFormat(locale, {
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);

    return `${formattedNumber} ${currencySymbol}`;
  } else {
    // Use regular format for smaller numbers
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${formattedNumber} ${currencySymbol}`;
  }
};

/**
 * Alternative: Format currency with custom options
 * @param {number} amount - The numeric amount to format
 * @param {Object} options - Formatting options
 * @param {string} [options.locale='tn-TN'] - Locale string
 * @param {string} [options.currency='TND'] - Currency code
 * @param {number} [options.decimals=2] - Number of decimal places
 * @param {boolean} [options.showSymbol=true] - Whether to show currency symbol
 * @param {string} [options.spacer=' '] - Space between number and symbol
 * @returns {string} - Formatted currency string
 */
export const formatCurrencyAdvanced = (amount, options = {}) => {
  const {
    locale = "tn-TN",
    currency = "TND",
    decimals = 2,
    showSymbol = true,
    spacer = " ",
  } = options;

  if (typeof amount !== "number") return "";

  // Format the number
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  if (!showSymbol) return formattedNumber;

  // Get the currency symbol
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });

  const parts = currencyFormatter.formatToParts(1);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || currency;

  return `${formattedNumber}${spacer}${currencySymbol}`;
};

/**
 * Format currency compactly (e.g., 1.5K TND, 2.3M TND)
 * @param {number} amount - The numeric amount to format
 * @param {string} [locale='tn-TN'] - Optional locale string
 * @param {string} [currency='TND'] - Optional currency code
 * @returns {string} - Compact formatted currency string
 */
export const formatCurrencyCompact = (
  amount,
  locale = "tn-TN",
  currency = "TND"
) => {
  if (typeof amount !== "number") return "";

  const formattedNumber = new Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);

  // Get the currency symbol
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });

  const parts = currencyFormatter.formatToParts(1);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || currency;

  return `${formattedNumber} ${currencySymbol}`;
};

// Export default
export default formatCurrency;
