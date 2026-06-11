import { describe, expect, it } from 'vitest';
import {
  addCustomToSelection,
  attachedCategoriesToSelection,
  selectionToSyncPayload,
  togglePresetSelection,
} from '@/lib/vendorCategorySelection';
import type { VendorServiceCategory } from '@/api/types/reference';

const catering: VendorServiceCategory = {
  id: 1,
  slug: 'catering',
  name_en: 'Catering',
  name_ar: 'تموين',
  is_active: true,
  display_order: 1,
};

describe('vendorCategorySelection', () => {
  it('converts attached categories to selection', () => {
    const items = attachedCategoriesToSelection([
      { id: 10, service_category_id: 1, slug: 'catering', name_en: 'Catering' },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].service_category_id).toBe(1);
  });

  it('toggles preset selection', () => {
    const added = togglePresetSelection([], catering);
    expect(added).toHaveLength(1);
    const removed = togglePresetSelection(added, catering);
    expect(removed).toHaveLength(0);
  });

  it('builds sync payload with custom name', () => {
    const items = addCustomToSelection([], 'Balloon Art', 'فن البالونات');
    expect(selectionToSyncPayload(items)).toEqual({
      categories: [{ name_en: 'Balloon Art', name_ar: 'فن البالونات' }],
    });
  });

  it('matches existing preset when adding custom by name', () => {
    const items = addCustomToSelection([], 'Catering', undefined, [catering]);
    expect(items[0].service_category_id).toBe(1);
  });
});
