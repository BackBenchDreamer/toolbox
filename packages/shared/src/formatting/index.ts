/**
 * Formatting utilities shared across tools.
 */

/** Format a number as a locale currency string */
export function formatCurrency(
  amount: number,
  currency = 'INR',
  locale = 'en-IN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a plain number with thousands separators */
export function formatNumber(value: number, decimals = 2, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Round to N decimal places (avoids floating-point drift) */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Format a percentage */
export function formatPercent(value: number, decimals = 2): string {
  return `${roundTo(value, decimals)}%`;
}

/** Clamp a value within [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
