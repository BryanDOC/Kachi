export function formatCurrency(amount: number, currencyCode: string): string {
  const currencySymbols: Record<string, string> = {
    PEN: 'S/',
    USD: '$',
    EUR: '€',
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;
  const formattedAmount = amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${formattedAmount}`;
}

export function parseCurrencyAmount(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
