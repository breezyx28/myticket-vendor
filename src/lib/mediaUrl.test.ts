import { describe, expect, it } from 'vitest';
import {
  resolveStorageUrl,
  resolveUserAvatar,
  resolveVendorProfileImage,
} from '@/lib/mediaUrl';

describe('resolveStorageUrl', () => {
  it('passthroughs absolute URLs', () => {
    expect(resolveStorageUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });

  it('prefixes relative storage paths with api base', () => {
    expect(resolveStorageUrl('/storage/users/7/avatar.jpg')).toBe(
      'https://myticket-api.kat-jr.com/storage/users/7/avatar.jpg',
    );
  });

  it('returns null for empty values', () => {
    expect(resolveStorageUrl(null)).toBeNull();
    expect(resolveStorageUrl('  ')).toBeNull();
  });
});

describe('resolveVendorProfileImage', () => {
  it('prefers profile_image over profile_image_url', () => {
    expect(
      resolveVendorProfileImage({
        profile_image: 'https://cdn.example.com/a.jpg',
        profile_image_url: 'https://cdn.example.com/b.jpg',
      }),
    ).toBe('https://cdn.example.com/a.jpg');
  });

  it('falls back to profile_image_url', () => {
    expect(
      resolveVendorProfileImage({
        profile_image_url: '/storage/users/7/avatar.jpg',
      }),
    ).toBe('https://myticket-api.kat-jr.com/storage/users/7/avatar.jpg');
  });
});

describe('resolveUserAvatar', () => {
  it('checks profile_image, profile_image_url, then avatar_url', () => {
    expect(
      resolveUserAvatar({
        id: 1,
        email: 'a@b.com',
        full_name: 'A',
        profile_image: 'https://cdn.example.com/p.jpg',
        profile_image_url: 'https://cdn.example.com/u.jpg',
        avatar_url: 'https://cdn.example.com/a.jpg',
      }),
    ).toBe('https://cdn.example.com/p.jpg');
  });
});
