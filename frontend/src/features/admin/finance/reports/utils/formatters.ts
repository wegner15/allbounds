/**
 * Financial reports formatting utilities.
 */

export const formatUsd = (amount: number | null | undefined, includeCents = true): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount);
};

export const formatCurrency = (
  amount: number | null | undefined,
  currency = 'USD',
  includeCents = true
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency} 0.00`;
  }
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  });
  return `${currency} ${formatted}`;
};

export const formatPercent = (pct: number | null | undefined, digits = 1): string => {
  if (pct === null || pct === undefined || isNaN(pct)) return '0.0%';
  return `${pct.toFixed(digits)}%`;
};

export const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
};
