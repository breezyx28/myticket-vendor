import { baseApi } from '@/api/baseApi';
import type { Paginated, PaginationQuery, Slug } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type { Vendor, VendorRating } from '@/api/types/vendor';

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVendorBySlug: build.query<Vendor, { slug: Slug }>({
      query: ({ slug }) => ({ url: `/vendors/${encodeURIComponent(slug)}` }),
      transformResponse: (raw: Vendor | { data: Vendor }) =>
        unwrapData(raw) ?? (raw as Vendor),
      providesTags: (_res, _err, arg) => [{ type: 'Rating', id: `vendor:${arg.slug}` }],
    }),
    listVendorRatings: build.query<
      Paginated<VendorRating>,
      { slug: Slug } & PaginationQuery
    >({
      query: ({ slug, ...params }) => ({
        url: `/vendors/${encodeURIComponent(slug)}/ratings`,
        params,
      }),
      providesTags: (_res, _err, arg) => [{ type: 'Rating', id: `vendor-ratings:${arg.slug}` }],
    }),
  }),
});

export const {
  useGetVendorBySlugQuery,
  useListVendorRatingsQuery,
} = vendorsApi;
