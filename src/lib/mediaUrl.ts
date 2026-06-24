import { ENV } from '@/config/env';
import type { UserMe } from '@/api/types/user';
import type { Vendor } from '@/api/types/vendor';

function joinUrl(base: string, path: string): string {
  const left = base.endsWith('/') ? base.slice(0, -1) : base;
  const right = path.startsWith('/') ? path : `/${path}`;
  return `${left}${right}`;
}

/** Resolve relative `/storage/...` paths to absolute URLs; passthrough http(s) URLs. */
export function resolveStorageUrl(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return joinUrl(ENV.apiBase, raw);
  return raw;
}

export function resolveVendorProfileImage(
  vendor: Pick<Vendor, 'profile_image' | 'profile_image_url'> | null | undefined,
): string | null {
  if (!vendor) return null;
  return resolveStorageUrl(vendor.profile_image ?? vendor.profile_image_url);
}

export function resolveUserAvatar(user: UserMe | null | undefined): string | null {
  if (!user) return null;
  const candidate =
    (typeof user.profile_image === 'string' ? user.profile_image : null) ??
    user.profile_image_url ??
    user.avatar_url ??
    null;
  return resolveStorageUrl(candidate);
}
