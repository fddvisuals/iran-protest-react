/**
 * Formats a number with thousand separators (commas)
 * @param num - The number to format
 * @returns Formatted string with commas as thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Formats a number with thousand separators, handling edge cases
 * @param num - The number to format (can be undefined or null)
 * @returns Formatted string with commas as thousand separators, or '0' for invalid inputs
 */
export const formatNumberSafe = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }
  return formatNumber(num);
};