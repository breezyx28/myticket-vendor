import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe('i18n locale parity', () => {
  it('en and ar have the same translation keys', () => {
    const enKeys = new Set(flattenKeys(en));
    const arKeys = new Set(flattenKeys(ar));
    const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
    const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));
    expect(missingInAr).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});
