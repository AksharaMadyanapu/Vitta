import { format, parseISO } from 'date-fns';

/**
 * Format a number into Indian Rupee format (e.g., ₹12,45,000).
 * Indian numbering system places commas after the first three digits (from the right)
 * and thereafter every two digits.
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const [integerPart, decimalPart] = absAmount.toFixed(showDecimals ? 2 : 0).split('.');

  // Indian format regex: last 3 digits, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = `₹${formattedInteger}${showDecimals && decimalPart ? `.${decimalPart}` : ''}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Format currency in Indian compact notation (e.g. ₹12.4L, ₹1.2Cr, ₹85K)
 * Perfect for compact metric cards.
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  let formatted = '';

  if (abs >= 10000000) {
    // Crores (1 Cr = 1,00,00,000)
    const cr = abs / 10000000;
    formatted = `₹${cr >= 10 ? cr.toFixed(1) : cr.toFixed(2)}Cr`;
  } else if (abs >= 100000) {
    // Lakhs (1 L = 1,00,000)
    const l = abs / 100000;
    formatted = `₹${l >= 10 ? l.toFixed(1) : l.toFixed(1)}L`;
  } else if (abs >= 1000) {
    // Thousands (K)
    const k = abs / 1000;
    formatted = `₹${k.toFixed(1)}K`;
  } else {
    formatted = `₹${Math.round(abs)}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format date string safely
 */
export function formatDate(dateStr: string | Date | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, fmt);
  } catch {
    return String(dateStr);
  }
}

