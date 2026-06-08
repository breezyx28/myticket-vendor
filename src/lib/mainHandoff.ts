const MAIN_SOURCE = 'main-website';

export function isMainWebsiteHandoff(source: string | null | undefined): boolean {
  return source === MAIN_SOURCE;
}

export function parseHandoffEmail(value: string | null | undefined): string | null {
  const email = value?.trim();
  if (!email || !email.includes('@')) return null;
  return email;
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

  let email = emailFromQuery ?? parseHandoffEmail(nested?.get('email') ?? null);
  const fromMainWebsite =
    isMainWebsiteHandoff(source) || isMainWebsiteHandoff(nested?.get('source') ?? null);

  return {
    redirect,
    email,
    fromMainWebsite,
  };
}
