import { describe, expect, it } from 'vitest';
import { resolvePostLoginRoute } from '@/lib/resolvePostLoginRoute';

describe('resolvePostLoginRoute', () => {
  it('sends organizer to access denied', () => {
    expect(
      resolvePostLoginRoute({
        role: 'organizer',
        hasVendorApplication: false,
        applicationStatus: null,
        hasVendorProfile: false,
      }),
    ).toBe('/access-denied');
  });

  it('sends talent to access denied', () => {
    expect(
      resolvePostLoginRoute({
        role: 'talent',
        hasVendorApplication: true,
        applicationStatus: 'approved',
        hasVendorProfile: false,
      }),
    ).toBe('/access-denied');
  });

  it('sends approved vendor with profile to dashboard home', () => {
    expect(
      resolvePostLoginRoute({
        role: 'vendor',
        hasVendorApplication: true,
        applicationStatus: 'approved',
        hasVendorProfile: true,
      }),
    ).toBe('/');
  });

  it('sends vendor role without profile to dashboard home', () => {
    expect(
      resolvePostLoginRoute({
        role: 'vendor',
        hasVendorApplication: true,
        applicationStatus: 'approved',
        hasVendorProfile: false,
      }),
    ).toBe('/');
  });

  it('sends guest without application to wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasVendorApplication: false,
        applicationStatus: null,
        hasVendorProfile: false,
      }),
    ).toBe('/application');
  });

  it('sends submitted application to status page', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasVendorApplication: true,
        applicationStatus: 'submitted',
        hasVendorProfile: false,
      }),
    ).toBe('/application/status');
  });

  it('sends draft application to wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasVendorApplication: true,
        applicationStatus: 'draft',
        hasVendorProfile: false,
      }),
    ).toBe('/application');
  });

  it('sends rejected application to wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasVendorApplication: true,
        applicationStatus: 'rejected',
        hasVendorProfile: false,
      }),
    ).toBe('/application');
  });

  it('sends approved guest without profile to home (provisioning)', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasVendorApplication: true,
        applicationStatus: 'approved',
        hasVendorProfile: false,
      }),
    ).toBe('/');
  });

  it('defaults unknown state to application wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasVendorApplication: true,
        applicationStatus: 'not_started',
        hasVendorProfile: false,
      }),
    ).toBe('/application');
  });
});
