/** Item for `PUT .../categories` bulk sync — exactly one key per object. */
export type CategorySyncItem =
  | { service_category_id: number; slug?: never; name_en?: never; name?: never; name_ar?: never }
  | { slug: string; service_category_id?: never; name_en?: never; name?: never; name_ar?: never }
  | {
      name_en: string;
      name_ar?: string;
      service_category_id?: never;
      slug?: never;
      name?: never;
    }
  | {
      name: string;
      name_ar?: string;
      service_category_id?: never;
      slug?: never;
      name_en?: never;
    };

export interface SyncCategoriesRequest {
  categories: CategorySyncItem[];
}

export interface CreateVendorServiceCategoryRequest {
  name_en?: string;
  name?: string;
  name_ar?: string;
}
