import type { CategorySyncItem } from '@/api/types/category';
import type { VendorApplicationCategory } from '@/api/types/roleApplication';
import type { VendorServiceCategory } from '@/api/types/reference';
import type { VendorProfileCategory } from '@/api/types/vendor';

export interface CategorySelectionItem {
  key: string;
  service_category_id?: number;
  slug?: string;
  name_en: string;
  name_ar?: string;
  is_custom?: boolean;
}

type AttachedCategory = VendorApplicationCategory | VendorProfileCategory;

function selectionKey(item: {
  service_category_id?: number;
  slug?: string;
  name_en?: string;
}): string {
  if (item.service_category_id != null) return `id:${item.service_category_id}`;
  if (item.slug) return `slug:${item.slug}`;
  return `name:${(item.name_en ?? '').trim().toLowerCase()}`;
}

export function attachedCategoryToSelection(cat: AttachedCategory): CategorySelectionItem {
  return {
    key: selectionKey(cat),
    service_category_id: cat.service_category_id,
    slug: cat.slug,
    name_en: cat.name_en ?? cat.slug?.replace(/_/g, ' ') ?? `#${cat.service_category_id}`,
    name_ar: cat.name_ar,
    is_custom: cat.is_custom,
  };
}

export function attachedCategoriesToSelection(
  categories: AttachedCategory[] | undefined,
): CategorySelectionItem[] {
  return (categories ?? []).map(attachedCategoryToSelection);
}

export function presetToSelection(cat: VendorServiceCategory): CategorySelectionItem {
  return {
    key: selectionKey(cat),
    service_category_id: cat.id,
    slug: cat.slug,
    name_en: cat.name_en,
    name_ar: cat.name_ar,
    is_custom: cat.is_custom,
  };
}

export function customNameToSelection(name_en: string, name_ar?: string): CategorySelectionItem {
  const trimmed = name_en.trim();
  return {
    key: `name:${trimmed.toLowerCase()}`,
    name_en: trimmed,
    name_ar: name_ar?.trim() || undefined,
    is_custom: true,
  };
}

export function selectionToSyncPayload(
  items: CategorySelectionItem[],
): { categories: CategorySyncItem[] } {
  return {
    categories: items.map((item) => {
      if (item.service_category_id != null && !item.is_custom) {
        return { service_category_id: item.service_category_id };
      }
      if (item.slug && !item.is_custom) {
        return { slug: item.slug };
      }
      return {
        name_en: item.name_en,
        ...(item.name_ar ? { name_ar: item.name_ar } : {}),
      };
    }),
  };
}

export function isCategorySelected(
  items: CategorySelectionItem[],
  cat: VendorServiceCategory,
): boolean {
  const key = selectionKey(cat);
  return items.some(
    (item) =>
      item.key === key ||
      item.service_category_id === cat.id ||
      (item.slug && item.slug === cat.slug),
  );
}

export function togglePresetSelection(
  items: CategorySelectionItem[],
  cat: VendorServiceCategory,
): CategorySelectionItem[] {
  if (isCategorySelected(items, cat)) {
    return items.filter(
      (item) =>
        item.key !== selectionKey(cat) &&
        item.service_category_id !== cat.id &&
        item.slug !== cat.slug,
    );
  }
  return [...items, presetToSelection(cat)];
}

export function findMatchingPreset(
  name: string,
  presets: VendorServiceCategory[],
): VendorServiceCategory | undefined {
  const normalized = name.trim().toLowerCase();
  return presets.find(
    (cat) =>
      cat.name_en.trim().toLowerCase() === normalized ||
      cat.name_ar?.trim() === name.trim() ||
      cat.slug.replace(/_/g, ' ').toLowerCase() === normalized,
  );
}

export function addCustomToSelection(
  items: CategorySelectionItem[],
  name_en: string,
  name_ar?: string,
  presets: VendorServiceCategory[] = [],
): CategorySelectionItem[] {
  const match = findMatchingPreset(name_en, presets);
  if (match) {
    return isCategorySelected(items, match) ? items : [...items, presetToSelection(match)];
  }
  const custom = customNameToSelection(name_en, name_ar);
  if (items.some((item) => item.key === custom.key)) return items;
  return [...items, custom];
}

export function removeSelectionItem(
  items: CategorySelectionItem[],
  key: string,
): CategorySelectionItem[] {
  return items.filter((item) => item.key !== key);
}
