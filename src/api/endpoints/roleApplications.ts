import { baseApi } from '@/api/baseApi';
import type { AcknowledgementResponse } from '@/api/types/auth';
import type { Id } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type {
  CreateVendorApplicationRequest,
  MyRoleApplications,
  RoleApplicationDetail,
  RoleApplicationDetailEnvelope,
  RoleApplicationKind,
  RoleApplicationSummary,
  UpdateVendorApplicationRequest,
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
} = roleApplicationsApi;
