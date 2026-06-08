import { baseApi } from '@/api/baseApi';
import { unwrapData } from '@/api/types/common';
import type {
  SaudiRegionsResponse,
  VendorServiceCategoriesResponse,
  VendorServiceCategory,
} from '@/api/types/reference';

export const referenceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSaudiRegions: build.query<SaudiRegionsResponse, void>({
      query: () => ({ url: '/reference/saudi-regions' }),
      providesTags: [{ type: 'SaudiRegion', id: 'LIST' }],
    }),
    getVendorServiceCategories: build.query<VendorServiceCategory[], void>({
      query: () => ({ url: '/reference/vendor-service-categories' }),
      transformResponse: (raw: VendorServiceCategoriesResponse | VendorServiceCategory[]) => {
        const data = unwrapData(raw);
        if (Array.isArray(data)) return data;
        if (Array.isArray(raw)) return raw;
        return [];
      },
      providesTags: [{ type: 'VendorServiceCategory', id: 'LIST' }],
    }),
  }),
});

export const { useGetSaudiRegionsQuery, useGetVendorServiceCategoriesQuery } = referenceApi;
