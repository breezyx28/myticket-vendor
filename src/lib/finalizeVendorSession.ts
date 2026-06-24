import { baseApi } from '@/api/baseApi';
import { meApi } from '@/api/endpoints/me';
import { roleApplicationsApi } from '@/api/endpoints/roleApplications';
import { clearTokens, persistAuthCookies } from '@/api/authToken';
import type { UserMe } from '@/api/types/user';
import { pickUserRole } from '@/lib/authMapper';
import { resolvePostLoginRoute } from '@/lib/resolvePostLoginRoute';
import type { AppDispatch } from '@/store';

export interface ParsedAuthSession {
  token: string;
  refresh_token: string | null;
  user: UserMe | null;
  expires_at: string | null;
}

export type FinalizeVendorSessionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason: 'access_denied' | 'invalid_role' };

export async function resolveRedirectAfterLogin(dispatch: AppDispatch) {
  const meResult = await dispatch(meApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
  const appsResult = await dispatch(
    roleApplicationsApi.endpoints.getMyRoleApplications.initiate(undefined, { forceRefetch: true }),
  );
  const profileResult = await dispatch(
    meApi.endpoints.getVendorProfile.initiate(undefined, { forceRefetch: true }),
  );

  const meData = meResult.data ?? (meResult.error ? null : undefined);
  const appsData = appsResult.data;
  const hasVendorProfile = Boolean(profileResult.data) && !profileResult.error;

  const role = meData ? pickUserRole(meData.roles, meData.role ?? null, 'guest') : null;
  const vendorApp = appsData?.vendor ?? null;

  return resolvePostLoginRoute({
    role,
    hasVendorApplication: Boolean(vendorApp),
    applicationStatus: vendorApp?.status ?? null,
    hasVendorProfile,
  });
}

export async function finalizeVendorSession(
  dispatch: AppDispatch,
  parsed: ParsedAuthSession,
): Promise<FinalizeVendorSessionResult> {
  persistAuthCookies({
    accessToken: parsed.token,
    refreshToken: parsed.refresh_token,
    expiresAt: parsed.expires_at,
    userSnapshot: parsed.user,
  });

  const role = parsed.user ? pickUserRole(parsed.user.roles, parsed.user.role ?? null, 'guest') : null;
  if (role === 'organizer' || role === 'talent') {
    clearTokens();
    dispatch(baseApi.util.resetApiState());
    return { ok: false, reason: 'access_denied' };
  }

  const redirectTo = await resolveRedirectAfterLogin(dispatch);
  return { ok: true, redirectTo };
}
