/**
 * Shared utility functions for parsing and validating numeric values
 * Used across multiple components to ensure consistent handling
 */

/**
 * Parse a value to a float with a default fallback
 * @param {any} value - The value to parse
 * @param {number} defaultValue - The default value if parsing fails (default: 0)
 * @returns {number} Parsed number or default value
 */
export const parseNumericValue = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Check if a value is a valid finite number
 * @param {any} value - The value to check
 * @returns {boolean} True if value is a valid number
 */
export const isValidNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};

/**
 * Format a number with a specific number of decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
};

/**
 * Parse percentage value (removes % symbol if present)
 * @param {string|number} value - The percentage value
 * @returns {number} Parsed percentage as decimal
 */
export const parsePercentage = (value) => {
  if (typeof value === 'string') {
    value = value.replace('%', '').trim();
  }
  return parseNumericValue(value);
};

/**
 * Format number with suffix (K, M, B)
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted string with suffix
 */
export const formatWithSuffix = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  
  return num.toFixed(decimals);
};
