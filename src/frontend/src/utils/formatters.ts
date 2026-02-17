// Utility functions for formatting dates and currency in Indonesian locale

export function formatDate(timestamp: bigint | number, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleDateString('id-ID', options || { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatDateShort(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatCurrency(amount: bigint | number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}
