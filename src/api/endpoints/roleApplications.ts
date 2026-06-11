import { baseApi } from '@/api/baseApi';
import type { AcknowledgementResponse } from '@/api/types/auth';
import type { Id } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type { SyncCategoriesRequest } from '@/api/types/category';
import type {
  AddVendorCategoryRequest,
  CreateVendorApplicationRequest,
  MyRoleApplications,
  RoleApplicationDetail,
  RoleApplicationDetailEnvelope,
  RoleApplicationKind,
  RoleApplicationSummary,
  UpdateVendorApplicationRequest,
  VendorApplicationCategory,
  VendorApplicationDocument,
  VendorApplicationDocumentUpload,
  VendorApplicationGalleryItem,
  VendorApplicationGalleryUpload,
} from '@/api/types/roleApplication';

const VENDOR = 'role-applications/vendor';

function normalizeMyRoleApplications(raw: unknown): MyRoleApplications {
  if (raw && typeof raw === 'object' && 'vendor' in (raw as object)) {
    return raw as MyRoleApplications;
  }

  const list = unwrapData(
    raw as RoleApplicationSummary[] | { data: RoleApplicationSummary[] } | null,
  );
  if (!Array.isArray(list)) return { vendor: null };

  const vendor = list.find(
    (item) =>
      item.application_type === 'vendor' ||
      item.kind === 'vendor' ||
      (item as { application_type?: string }).application_type === 'vendor',
  );

  return { vendor: vendor ?? null };
}

export const roleApplicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyRoleApplications: build.query<MyRoleApplications, void>({
      query: () => ({ url: '/role-applications/me' }),
      transformResponse: (raw: unknown) => normalizeMyRoleApplications(raw),
      providesTags: ['RoleApplication'],
    }),
    getRoleApplication: build.query<
      RoleApplicationDetail,
      { role: RoleApplicationKind; id: Id }
    >({
      query: ({ role, id }) => ({ url: `/role-applications/${role}/${id}` }),
      transformResponse: (raw: RoleApplicationDetail | RoleApplicationDetailEnvelope) =>
        unwrapData(raw) ?? (raw as RoleApplicationDetail),
      providesTags: (_res, _err, arg) => [
        { type: 'RoleApplication', id: `${arg.role}:${arg.id}` },
        'RoleApplication',
      ],
    }),
    createVendorApplication: build.mutation<
      RoleApplicationSummary,
      CreateVendorApplicationRequest
    >({
      query: (body) => ({ url: `/${VENDOR}`, method: 'POST', body }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication'],
    }),
    updateVendorApplication: build.mutation<
      RoleApplicationSummary,
      { id: Id; body: UpdateVendorApplicationRequest }
    >({
      query: ({ id, body }) => ({ url: `/${VENDOR}/${id}`, method: 'PATCH', body }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication'],
    }),
    submitVendorApplication: build.mutation<RoleApplicationSummary, { id: Id }>({
      query: ({ id }) => ({ url: `/${VENDOR}/${id}/submit`, method: 'POST' }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication', 'Me'],
    }),
    resubmitVendorApplication: build.mutation<RoleApplicationSummary, { id: Id }>({
      query: ({ id }) => ({ url: `/${VENDOR}/${id}/resubmit`, method: 'POST' }),
      transformResponse: (raw: RoleApplicationSummary | { data: RoleApplicationSummary }) =>
        unwrapData(raw) ?? (raw as RoleApplicationSummary),
      invalidatesTags: ['RoleApplication'],
    }),
    withdrawVendorApplication: build.mutation<AcknowledgementResponse, { id: Id }>({
      query: ({ id }) => ({ url: `/${VENDOR}/${id}/withdraw`, method: 'POST' }),
      invalidatesTags: ['RoleApplication'],
    }),
    addVendorDocument: build.mutation<
      VendorApplicationDocument,
      { id: Id; body: VendorApplicationDocumentUpload }
    >({
      query: ({ id, body }) => ({ url: `/${VENDOR}/${id}/documents`, method: 'POST', body }),
      transformResponse: (raw: VendorApplicationDocument | { data: VendorApplicationDocument }) =>
        unwrapData(raw) ?? (raw as VendorApplicationDocument),
      invalidatesTags: ['RoleApplication'],
    }),
    deleteVendorDocument: build.mutation<AcknowledgementResponse, { id: Id; docId: Id }>({
      query: ({ id, docId }) => ({
        url: `/${VENDOR}/${id}/documents/${docId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoleApplication'],
    }),
    addVendorGalleryItem: build.mutation<
      VendorApplicationGalleryItem,
      { id: Id; body: VendorApplicationGalleryUpload }
    >({
      query: ({ id, body }) => ({ url: `/${VENDOR}/${id}/gallery`, method: 'POST', body }),
      transformResponse: (raw: VendorApplicationGalleryItem | { data: VendorApplicationGalleryItem }) =>
        unwrapData(raw) ?? (raw as VendorApplicationGalleryItem),
      invalidatesTags: ['RoleApplication'],
    }),
    deleteVendorGalleryItem: build.mutation<AcknowledgementResponse, { id: Id; itemId: Id }>({
      query: ({ id, itemId }) => ({
        url: `/${VENDOR}/${id}/gallery/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoleApplication'],
    }),
    addVendorCategory: build.mutation<
      VendorApplicationCategory,
      { id: Id; body: AddVendorCategoryRequest }
    >({
      query: ({ id, body }) => ({ url: `/${VENDOR}/${id}/categories`, method: 'POST', body }),
      transformResponse: (raw: VendorApplicationCategory | { data: VendorApplicationCategory }) =>
        unwrapData(raw) ?? (raw as VendorApplicationCategory),
      invalidatesTags: ['RoleApplication'],
    }),
    deleteVendorCategory: build.mutation<AcknowledgementResponse, { id: Id; rowId: Id }>({
      query: ({ id, rowId }) => ({
        url: `/${VENDOR}/${id}/categories/${rowId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoleApplication'],
    }),
    syncVendorApplicationCategories: build.mutation<
      { categories: VendorApplicationCategory[] },
      { id: Id; body: SyncCategoriesRequest }
    >({
      query: ({ id, body }) => ({
        url: `/${VENDOR}/${id}/categories`,
        method: 'PUT',
        body,
      }),
      transformResponse: (
        raw:
          | { categories: VendorApplicationCategory[] }
          | { data: { categories: VendorApplicationCategory[] } },
      ) => {
        const data = unwrapData(raw as { data: { categories: VendorApplicationCategory[] } });
        if (data?.categories) return data;
        return raw as { categories: VendorApplicationCategory[] };
      },
      invalidatesTags: ['RoleApplication'],
    }),
  }),
});

export const {
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useLazyGetRoleApplicationQuery,
  useCreateVendorApplicationMutation,
  useUpdateVendorApplicationMutation,
  useSubmitVendorApplicationMutation,
  useResubmitVendorApplicationMutation,
  useWithdrawVendorApplicationMutation,
  useAddVendorDocumentMutation,
  useDeleteVendorDocumentMutation,
  useAddVendorGalleryItemMutation,
  useDeleteVendorGalleryItemMutation,
  useAddVendorCategoryMutation,
  useDeleteVendorCategoryMutation,
  useSyncVendorApplicationCategoriesMutation,
} = roleApplicationsApi;
