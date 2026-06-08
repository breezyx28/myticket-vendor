import type { VendorApplicationDetail } from '@/types/domain';

export const VENDOR_BIO_MIN_CHARS = 25;
export const VENDOR_BIO_MAX_CHARS = 500;
export const BUSINESS_NAME_MAX = 160;
export const CONTACT_PHONE_MAX = 20;
export const MEDIA_URL_MAX = 500;
export const COVERAGE_AREA_MAX = 255;

export function isVendorApplicationReady(app: VendorApplicationDetail): boolean {
  const v = app.vendor_application;
  if (!v) return false;
  const name = v.profile_name?.trim() || v.business_name?.trim();
  return (
    Boolean(name) &&
    Boolean(v.contact_email?.trim()) &&
    (v.bio?.trim().length ?? 0) >= VENDOR_BIO_MIN_CHARS &&
    (v.documents?.length ?? 0) > 0 &&
    (v.gallery?.length ?? 0) > 0 &&
    (v.categories?.length ?? 0) > 0
  );
}
