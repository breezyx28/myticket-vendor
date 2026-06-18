import en from '@/i18n/locales/en.json';
import type { TFunction } from 'i18next';

export const testT: TFunction = ((key: string, options?: Record<string, unknown>) => {
  const parts = key.split('.');
  let node: unknown = en;
  for (const part of parts) {
    if (node && typeof node === 'object') {
      node = (node as Record<string, unknown>)[part];
    }
  }
  if (typeof node !== 'string') return key;
  return node.replace(/\{\{(\w+)\}\}/g, (_, token: string) => String(options?.[token] ?? ''));
}) as TFunction;
