import { describe, expect, it } from 'vitest';
import {
  createVendorApplicationSchema,
  vendorApplicationPatchSchema,
  vendorDocumentSchema,
  vendorGalleryItemSchema,
} from '@/schemas/application';

describe('createVendorApplicationSchema', () => {
  it('requires profile_name on create (not business_name)', async () => {
    await expect(
      createVendorApplicationSchema.validate({
        profile_name: 'Acme Catering',
        contact_email: 'vendor@example.com',
      }),
    ).resolves.toMatchObject({
      profile_name: 'Acme Catering',
      contact_email: 'vendor@example.com',
    });
  });

  it('rejects create payload using business_name instead of profile_name', async () => {
    await expect(
      createVendorApplicationSchema.validate({
        business_name: 'Acme Catering',
        contact_email: 'vendor@example.com',
      }),
    ).rejects.toThrow();
  });
});

describe('vendorApplicationPatchSchema', () => {
  it('accepts business_name on patch (not profile_name)', async () => {
    await expect(
      vendorApplicationPatchSchema.validate({
        business_name: 'Acme Catering LLC',
        bio: 'We cater weddings and corporate events across Riyadh.',
      }),
    ).resolves.toMatchObject({
      business_name: 'Acme Catering LLC',
    });
  });

  it('rejects patch payload using profile_name', async () => {
    await expect(
      vendorApplicationPatchSchema.validate({
        profile_name: 'Acme Catering',
      }),
    ).rejects.toThrow();
  });
});

describe('vendorDocumentSchema', () => {
  it('accepts a document URL', async () => {
    await expect(
      vendorDocumentSchema.validate({
        kind: 'document',
        value: 'https://cdn.example.com/license.pdf',
        label: 'Commercial license',
      }),
    ).resolves.toMatchObject({ kind: 'document' });
  });
});

describe('vendorGalleryItemSchema', () => {
  it('accepts a gallery image URL', async () => {
    await expect(
      vendorGalleryItemSchema.validate({
        image_url: 'https://cdn.example.com/booth.jpg',
        caption: 'Event setup',
      }),
    ).resolves.toMatchObject({ image_url: 'https://cdn.example.com/booth.jpg' });
  });
});
