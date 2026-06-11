import { ENV } from '@/config/env';

/**
 * Normalise API notification `href` to an in-app vendor route.
 * Handles full URLs with FRONTEND_VENDOR_URL prefix or relative paths.
 */
export function normalizeNotificationHref(href: string | null | undefined): string | undefined {
  if (!href?.trim()) return undefined;
  const raw = href.trim();

  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const url = new URL(raw);
      const vendorOrigin = new URL(ENV.vendorDashboardUrl || window.location.origin).origin;
      if (url.origin === vendorOrigin || url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}` || '/';
      }
      return raw;
    }
  } catch {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}
