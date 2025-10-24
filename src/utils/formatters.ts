export function normalizeDate(yymmdd: string): string {
  if (!yymmdd || yymmdd.length !== 6) {
    return new Date().toISOString().split('T')[0];
  }

  const year = parseInt(yymmdd.substring(0, 2), 10);
  const month = yymmdd.substring(2, 4);
  const day = yymmdd.substring(4, 6);

  const fullYear = year >= 50 ? 1900 + year : 2000 + year;

  return `${fullYear}-${month}-${day}`;
}

export function formatCurrency(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(num);
}

export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
