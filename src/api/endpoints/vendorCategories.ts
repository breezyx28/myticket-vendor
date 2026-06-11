import { baseApi } from '@/api/baseApi';
import { unwrapData } from '@/api/types/common';
import type { CreateVendorServiceCategoryRequest } from '@/api/types/category';
import type {
  VendorServiceCategoriesResponse,
  VendorServiceCategory,
} from '@/api/types/reference';

function normalizeCategoryList(
  raw: VendorServiceCategoriesResponse | VendorServiceCategory[],
): VendorServiceCategory[] {
  const data = unwrapData(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(raw)) return raw;
  return [];
}

export const vendorCategoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listVendorServiceCategories: build.query<VendorServiceCategory[], void>({
      query: () => ({ url: '/vendor-service-categories' }),
      transformResponse: normalizeCategoryList,
      providesTags: [{ type: 'VendorServiceCategory', id: 'LIST' }],
    }),
    createVendorServiceCategory: build.mutation<
      VendorServiceCategory,
      CreateVendorServiceCategoryRequest
    >({
      query: (body) => ({ url: '/vendor-service-categories', method: 'POST', body }),
      transformResponse: (raw: VendorServiceCategory | { data: VendorServiceCategory }) =>
        unwrapData(raw) ?? (raw as VendorServiceCategory),
      invalidatesTags: [{ type: 'VendorServiceCategory', id: 'LIST' }],
    }),
  }),
});

export const {
  useListVendorServiceCategoriesQuery,
  useCreateVendorServiceCategoryMutation,
} = vendorCategoriesApi;
