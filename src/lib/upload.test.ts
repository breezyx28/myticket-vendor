import { describe, expect, it } from 'vitest';
import type { UploadContext } from '@/lib/upload';

describe('UploadContext', () => {
  it('includes vendor_profile_gallery for live profile gallery uploads', () => {
    const contexts: UploadContext[] = [
      'vendor_application',
      'vendor_document',
      'vendor_profile',
      'vendor_profile_gallery',
    ];
    expect(contexts).toContain('vendor_profile_gallery');
  });
});
