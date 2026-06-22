const MAIN_SOURCE = 'main-website';

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

  return {
    redirect,
    email,
    fromMainWebsite,
  };
}
