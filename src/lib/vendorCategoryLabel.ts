import type { VendorServiceCategory } from '@/api/types/reference';

export interface VendorCategoryLabelFields {
  slug?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  service_category_id?: number;
}

export function buildVendorCategoryRefMap(
  categories: VendorServiceCategory[],
): Map<number, VendorCategoryLabelFields> {
  const map = new Map<number, VendorCategoryLabelFields>();
  for (const category of categories) {
    map.set(category.id, category);
  }
  return map;
}

export function vendorCategoryLabel(
  category: VendorCategoryLabelFields,
  isAr: boolean,
  fallbackById?: Map<number, VendorCategoryLabelFields>,
): string {
  if (isAr && category.name_ar) return category.name_ar;
  if (category.name_en) return category.name_en;
  if (category.slug) return category.slug.replace(/_/g, ' ');
  if (category.service_category_id != null && fallbackById) {
    const ref = fallbackById.get(category.service_category_id);
    if (ref) return vendorCategoryLabel(ref, isAr);
  }
  if (category.service_category_id != null) {
    return `#${category.service_category_id}`;
  }
  return '—';
}
