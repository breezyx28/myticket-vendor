import type { VendorProfileGalleryItem, VendorProfileGallerySyncItem } from '@/api/types/vendor';

export interface GalleryEditorItem {
  id: number;
  image_url: string;
  caption: string;
  position: number;
}

export function sortGalleryItems(items: VendorProfileGalleryItem[]): VendorProfileGalleryItem[] {
  return [...items].sort((a, b) => a.position - b.position || a.id - b.id);
}

export function profileGalleryToEditorItems(
  items: VendorProfileGalleryItem[] | undefined,
): GalleryEditorItem[] {
  return sortGalleryItems(items ?? []).map((item, index) => ({
    id: item.id,
    image_url: item.image_url,
    caption: item.caption ?? '',
    position: index,
  }));
}

export function editorItemsToSyncPayload(
  items: GalleryEditorItem[],
): { gallery: VendorProfileGallerySyncItem[] } {
  return {
    gallery: items.map((item, index) => ({
      image_url: item.image_url,
      caption: item.caption.trim() || null,
      position: index,
    })),
  };
}

export function isGalleryEditorDirty(
  server: GalleryEditorItem[],
  draft: GalleryEditorItem[],
): boolean {
  if (server.length !== draft.length) return true;
  return draft.some((item, index) => {
    const baseline = server[index];
    return (
      baseline.id !== item.id ||
      baseline.image_url !== item.image_url ||
      baseline.caption !== item.caption
    );
  });
}

export function moveGalleryEditorItem(
  items: GalleryEditorItem[],
  id: number,
  direction: 'up' | 'down',
): GalleryEditorItem[] {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return items;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next.map((item, position) => ({ ...item, position }));
}

export function updateGalleryCaption(
  items: GalleryEditorItem[],
  id: number,
  caption: string,
): GalleryEditorItem[] {
  return items.map((item) => (item.id === id ? { ...item, caption } : item));
}
