const MAIN_SOURCE = 'main-website';

const SESSION_HANDOFF_KEYS = ['token', 'expires_at', 'refresh_token'] as const;

export function isMainWebsiteHandoff(source: string | null | undefined): boolean {
  return source === MAIN_SOURCE;
}

export function parseHandoffEmail(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  const candidates = [raw];
  if (raw.includes('%')) {
    try {
      candidates.push(decodeURIComponent(raw));
    } catch {
      // ignore malformed percent-encoding
    }
  }

  for (const candidate of candidates) {
    const email = candidate.trim();
    if (email.includes('@')) return email;
  }

  return null;
}

function parseHandoffToken(value: string | null | undefined): string | null {
  const token = value?.trim();
  return token && token.length > 0 ? token : null;
}

export interface SessionHandoff {
  token: string;
  expiresAt: string | null;
  refreshToken: string | null;
}

function readSessionHandoffFromParams(
  params: URLSearchParams,
  fromMainWebsite: boolean,
): SessionHandoff | null {
  if (!fromMainWebsite) return null;

  const token =
    parseHandoffToken(params.get('token')) ??
    parseHandoffToken(params.get('access_token'));
  if (!token) return null;

  const expiresRaw = params.get('expires_at')?.trim();
  const refreshRaw = params.get('refresh_token')?.trim();

  return {
    token,
    expiresAt: expiresRaw && expiresRaw.length > 0 ? expiresRaw : null,
    refreshToken: refreshRaw && refreshRaw.length > 0 ? refreshRaw : null,
  };
}

export function buildLoginUrl(intendedPath: string): string {
  const params = new URLSearchParams();
  if (intendedPath && intendedPath !== '/') {
    params.set('redirect', intendedPath);
  }
  const query = params.toString();
  return query ? `/login?${query}` : '/login';
}

export function resolvePostLoginPath(
  redirectParam: string | null | undefined,
  fallback = '/',
): string {
  if (!redirectParam) return fallback;
  const trimmed = redirectParam.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  return trimmed;
}

function nestedRedirectParams(redirectParam: string | null): URLSearchParams | null {
  if (!redirectParam) return null;
  const query = redirectParam.split('?')[1];
  if (!query) return null;
  return new URLSearchParams(query);
}

export function readMainHandoff(searchParams: URLSearchParams) {
  const redirect = resolvePostLoginPath(searchParams.get('redirect'));
  const emailFromQuery = parseHandoffEmail(searchParams.get('email'));
  const source = searchParams.get('source');
  const nested = nestedRedirectParams(searchParams.get('redirect'));

  const email = emailFromQuery ?? parseHandoffEmail(nested?.get('email') ?? null);
  const fromMainWebsite =
    isMainWebsiteHandoff(source) || isMainWebsiteHandoff(nested?.get('source') ?? null);

  const sessionHandoff =
    readSessionHandoffFromParams(searchParams, fromMainWebsite) ??
    (nested ? readSessionHandoffFromParams(nested, fromMainWebsite) : null);

  return {
    redirect,
    email,
    fromMainWebsite,
    sessionHandoff,
  };
}

/** Remove sensitive session handoff query keys from a URL pathname + search. */
export function stripSessionHandoffParams(pathname: string, search: string): string {
  const url = new URL(pathname + search, 'http://local');
  for (const key of SESSION_HANDOFF_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.delete('access_token');

  const cleanedSearch = url.searchParams.toString();
  return cleanedSearch ? `${url.pathname}?${cleanedSearch}` : url.pathname;
}
