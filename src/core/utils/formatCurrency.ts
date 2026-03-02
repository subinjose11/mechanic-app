import { env } from '@core/config/env';

export function formatCurrency(amount: number): string {
  return `${env.DEFAULT_CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 100000) {
    return `${env.DEFAULT_CURRENCY_SYMBOL}${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `${env.DEFAULT_CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleanValue) || 0;
}
