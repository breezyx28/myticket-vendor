import { dateTimeLocale } from '@/lib/locale';

export function formatDateTime(value: string | Date, lng: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(dateTimeLocale(lng));
}

export function formatDate(value: string | Date, lng: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(dateTimeLocale(lng));
}

export function formatNumber(value: number, lng: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(dateTimeLocale(lng), options).format(value);
}
