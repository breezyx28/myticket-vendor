import { describe, expect, it } from 'vitest';
import {
  buildLoginUrl,
  isMainWebsiteHandoff,
  parseHandoffEmail,
  readMainHandoff,
  resolvePostLoginPath,
} from '@/lib/mainHandoff';

describe('mainHandoff', () => {
  it('detects main website source', () => {
    expect(isMainWebsiteHandoff('main-website')).toBe(true);
    expect(isMainWebsiteHandoff('other')).toBe(false);
  });

  it('parses valid emails only', () => {
    expect(parseHandoffEmail(' vendor@example.com ')).toBe('vendor@example.com');
    expect(parseHandoffEmail('not-an-email')).toBeNull();
  });

  it('builds login URL with redirect param', () => {
    expect(buildLoginUrl('/application')).toBe('/login?redirect=%2Fapplication');
    expect(buildLoginUrl('/')).toBe('/login');
  });

  it('rejects unsafe redirect targets', () => {
    expect(resolvePostLoginPath('//evil.com')).toBe('/');
    expect(resolvePostLoginPath('/application?step=1')).toBe('/application?step=1');
  });

  it('reads handoff email from nested redirect', () => {
    const params = new URLSearchParams({
      redirect: '/application?source=main-website&email=vendor%40example.com',
    });
    const handoff = readMainHandoff(params);
    expect(handoff.email).toBe('vendor@example.com');
    expect(handoff.redirect).toBe('/application?source=main-website&email=vendor%40example.com');
  });
});
