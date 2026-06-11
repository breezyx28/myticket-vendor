import { ENV } from '@/config/env';
import { describe, expect, it } from 'vitest';
import { normalizeNotificationHref } from '@/lib/notificationHref';

describe('normalizeNotificationHref', () => {
  it('returns undefined for empty href', () => {
    expect(normalizeNotificationHref(null)).toBeUndefined();
    expect(normalizeNotificationHref('')).toBeUndefined();
  });

  it('keeps relative paths', () => {
    expect(normalizeNotificationHref('/engagements?focus=12')).toBe('/engagements?focus=12');
  });

  it('strips vendor dashboard origin from full URLs', () => {
    expect(
      normalizeNotificationHref(`${ENV.vendorDashboardUrl}/engagements?focus=12`),
    ).toBe('/engagements?focus=12');
  });
});
