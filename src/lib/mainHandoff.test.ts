import { describe, expect, it } from 'vitest';
import {
  buildLoginUrl,
  isMainWebsiteHandoff,
  parseHandoffEmail,
  readMainHandoff,
  resolvePostLoginPath,
  stripSessionHandoffParams,
} from '@/lib/mainHandoff';

describe('mainHandoff', () => {
  it('detects main website source', () => {
    expect(isMainWebsiteHandoff('main-website')).toBe(true);
    expect(isMainWebsiteHandoff('other')).toBe(false);
  });

  it('parses valid emails only', () => {
    expect(parseHandoffEmail(' vendor@example.com ')).toBe('vendor@example.com');
    expect(parseHandoffEmail('not-an-email')).toBeNull();
    expect(parseHandoffEmail('vendor%40example.com')).toBe('vendor@example.com');
  });

  it('reads handoff email from query string', () => {
    const params = new URLSearchParams({
      source: 'main-website',
      email: 'emam.malik.commiee%40gmail.com',
    });
    const handoff = readMainHandoff(params);
    expect(handoff.email).toBe('emam.malik.commiee@gmail.com');
    expect(handoff.fromMainWebsite).toBe(true);
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

  it('reads session token when source is main-website', () => {
    const params = new URLSearchParams({
      source: 'main-website',
      token: '2|abc',
      expires_at: '2026-06-23T12:00:00+00:00',
      email: 'vendor@example.com',
    });
    const handoff = readMainHandoff(params);
    expect(handoff.sessionHandoff).toEqual({
      token: '2|abc',
      expiresAt: '2026-06-23T12:00:00+00:00',
      refreshToken: null,
    });
  });

  it('ignores token without main-website source', () => {
    const params = new URLSearchParams({ token: '2|abc' });
    expect(readMainHandoff(params).sessionHandoff).toBeNull();
  });

  it('reads session token from nested redirect', () => {
    const params = new URLSearchParams({
      redirect: '/login?source=main-website&token=2%7Cxyz&email=v%40e.com',
    });
    const handoff = readMainHandoff(params);
    expect(handoff.sessionHandoff?.token).toBe('2|xyz');
    expect(handoff.email).toBe('v@e.com');
  });

  it('strips sensitive session handoff params', () => {
    expect(
      stripSessionHandoffParams(
        '/login',
        '?source=main-website&token=secret&expires_at=2026-01-01&email=a%40b.com',
      ),
    ).toBe('/login?source=main-website&email=a%40b.com');
  });
});
