import { describe, expect, it } from 'vitest';
import {
  editorItemsToSyncPayload,
  isGalleryEditorDirty,
  moveGalleryEditorItem,
  profileGalleryToEditorItems,
} from '@/lib/vendorGalleryEditor';
import type { VendorProfileGalleryItem } from '@/api/types/vendor';

const sample: VendorProfileGalleryItem[] = [
  { id: 2, vendor_profile_id: 1, image_url: 'https://cdn.example.com/b.jpg', caption: 'B', position: 1 },
  { id: 1, vendor_profile_id: 1, image_url: 'https://cdn.example.com/a.jpg', caption: 'A', position: 0 },
];

describe('vendorGalleryEditor', () => {
  it('sorts gallery items by position', () => {
    const items = profileGalleryToEditorItems(sample);
    expect(items.map((item) => item.id)).toEqual([1, 2]);
  });

  it('detects caption and order changes', () => {
    const server = profileGalleryToEditorItems(sample);
    const reordered = moveGalleryEditorItem(server, 1, 'down');
    expect(isGalleryEditorDirty(server, reordered)).toBe(true);
  });

  it('builds sync payload with positions', () => {
    const items = profileGalleryToEditorItems(sample);
    expect(editorItemsToSyncPayload(items)).toEqual({
      gallery: [
        { image_url: 'https://cdn.example.com/a.jpg', caption: 'A', position: 0 },
        { image_url: 'https://cdn.example.com/b.jpg', caption: 'B', position: 1 },
      ],
    });
  });
});
