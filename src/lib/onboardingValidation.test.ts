import { describe, expect, it } from 'vitest';
import { isVendorApplicationReady } from '@/lib/onboardingValidation';
import type { VendorApplicationDetail } from '@/types/domain';

function baseApp(overrides: Partial<VendorApplicationDetail['vendor_application']> = {}): VendorApplicationDetail {
  return {
    id: 1,
    status: 'draft',
    vendor_application: {
      id: 10,
      profile_name: 'Acme Catering',
      contact_email: 'vendor@example.com',
      bio: 'We cater weddings and corporate events across Riyadh.',
      documents: [{ id: 1, kind: 'document', value: 'https://cdn.example.com/license.pdf', label: null, position: 0 }],
      gallery: [{ id: 1, image_url: 'https://cdn.example.com/booth.jpg', caption: null, position: 0 }],
      ...overrides,
    },
  };
}

describe('isVendorApplicationReady', () => {
  it('returns true when all client gates pass', () => {
    expect(isVendorApplicationReady(baseApp())).toBe(true);
  });

  it('accepts business_name when profile_name is absent after first patch', () => {
    expect(
      isVendorApplicationReady(
        baseApp({ profile_name: null, business_name: 'Acme Catering LLC' }),
      ),
    ).toBe(true);
  });

  it('returns false without documents', () => {
    expect(isVendorApplicationReady(baseApp({ documents: [] }))).toBe(false);
  });

  it('returns false without gallery', () => {
    expect(isVendorApplicationReady(baseApp({ gallery: [] }))).toBe(false);
  });

  it('returns false when bio is too short', () => {
    expect(isVendorApplicationReady(baseApp({ bio: 'Too short' }))).toBe(false);
  });

  it('returns false without contact email', () => {
    expect(isVendorApplicationReady(baseApp({ contact_email: '' }))).toBe(false);
  });
});
