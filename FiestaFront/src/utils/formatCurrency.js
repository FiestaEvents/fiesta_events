// src/utils/formatCurrency.js

/**
 * Formats a number as currency.
 * @param {number} amount - The numeric amount to format
 * @param {string} [locale='tn-TN'] - Optional locale string
 * @param {string} [currency='TND'] - Optional currency code
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, locale = 'tn-TN', currency = 'TND') => {
  if (typeof amount !== 'number') return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

