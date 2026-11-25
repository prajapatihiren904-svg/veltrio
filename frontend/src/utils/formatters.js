// ==========================================
// CURRENCY FORMATTER
// ==========================================

export function formatCurrency(amount, currency = 'INR') {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return '—';
  }

  const currencyCode = String(currency || 'INR').toUpperCase();

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}


// ==========================================
// DATE FORMATTER
// ==========================================

export function formatDate(date) {
  if (!date) {
    return 'N/A';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
}


// ==========================================
// PERCENTAGE FORMATTER
// ==========================================

export function formatPercent(value, digits = 1) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0%';
  }

  return `${number.toFixed(digits)}%`;
}