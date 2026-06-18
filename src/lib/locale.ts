import type { AppLanguage } from '@/i18n';
import { SUPPORTED_LANGUAGES } from '@/i18n';

export { SUPPORTED_LANGUAGES };
export type { AppLanguage };

export function isAppLanguage(value: string): value is AppLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function normalizeLanguage(lng: string): AppLanguage {
  return lng.startsWith('ar') ? 'ar' : 'en';
}

export function apiLanguageHeader(lng: string): string {
  return normalizeLanguage(lng);
}

export function dateTimeLocale(lng: string): string {
  return normalizeLanguage(lng) === 'ar' ? 'ar-SA' : 'en-US';
}
