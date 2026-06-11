import { baseApi } from '@/api/baseApi';
import type { AcknowledgementResponse } from '@/api/types/auth';
import { unwrapData } from '@/api/types/common';
import type { Id, ResourceEnvelope } from '@/api/types/common';
import type { SyncCategoriesRequest } from '@/api/types/category';
import type {
  SyncVendorProfileGalleryRequest,
  UpdateVendorProfileRequest,
  Vendor,
  VendorProfileCategory,
  VendorProfileGalleryItem,
  VendorProfileGalleryUpload,
} from '@/api/types/vendor';
import type {
  RegisterDeviceRequest,
  UpdateMeRequest,
  UpdateUserPreferencesRequest,
  UpdateVendorAvailabilityRequest,
  UserDevice,
  UserMe,
  UserPreferences,
  UserPreferencesResponse,
  UserSession,
  VendorAvailabilityResponse,
} from '@/api/types/user';

function unwrapUserMeResponse(response: unknown): UserMe {
  if (response && typeof response === 'object' && 'data' in response) {
    const wrapped = response as ResourceEnvelope<UserMe>;
    if (wrapped.data != null) return wrapped.data;
  }
  return response as UserMe;
}

export const meApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserMe, void>({
      query: () => ({ url: '/me' }),
      transformResponse: (response: unknown) => unwrapUserMeResponse(response),
      providesTags: ['Me'],
    }),
    updateMe: build.mutation<UserMe, UpdateMeRequest>({
      query: (body) => ({ url: '/me', method: 'PATCH', body }),
      transformResponse: (response: unknown) => unwrapUserMeResponse(response),
      invalidatesTags: ['Me'],
    }),
    listSessions: build.query<UserSession[], void>({
      query: () => ({ url: '/me/sessions' }),
      transformResponse: (raw: UserSession[] | { data?: UserSession[] } | null | undefined) => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
        return [];
      },
      providesTags: ['Session'],
    }),
    revokeSession: build.mutation<AcknowledgementResponse, { id: Id }>({
      query: ({ id }) => ({ url: `/me/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Session'],
    }),
    listDevices: build.query<UserDevice[], void>({
      query: () => ({ url: '/me/devices' }),
      transformResponse: (raw: UserDevice[] | { data: UserDevice[] }) =>
        Array.isArray(raw) ? raw : raw.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: 'Device' as const, id: d.id })),
              { type: 'Device' as const, id: 'LIST' },
            ]
          : [{ type: 'Device' as const, id: 'LIST' }],
    }),
    registerDevice: build.mutation<UserDevice, RegisterDeviceRequest>({
      query: (body) => ({ url: '/me/devices', method: 'POST', body }),
      invalidatesTags: ['Device'],
    }),
    removeDevice: build.mutation<AcknowledgementResponse, { id: Id }>({
      query: ({ id }) => ({ url: `/me/devices/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Device'],
    }),
    getPreferences: build.query<UserPreferences, void>({
      query: () => ({ url: '/me/preferences' }),
      transformResponse: (raw: UserPreferences | UserPreferencesResponse) =>
        'data' in (raw as UserPreferencesResponse)
          ? (raw as UserPreferencesResponse).data
          : (raw as UserPreferences),
      providesTags: ['Preferences'],
    }),
    updatePreferences: build.mutation<UserPreferences, UpdateUserPreferencesRequest>({
      query: (body) => ({ url: '/me/preferences', method: 'PATCH', body }),
      transformResponse: (raw: UserPreferences | UserPreferencesResponse) =>
        'data' in (raw as UserPreferencesResponse)
          ? (raw as UserPreferencesResponse).data
          : (raw as UserPreferences),
      invalidatesTags: ['Preferences', 'Me'],
    }),
    getVendorAvailability: build.query<VendorAvailabilityResponse, void>({
      query: () => ({ url: '/me/vendor-availability' }),
      providesTags: ['VendorAvailability'],
    }),
    setVendorAvailability: build.mutation<VendorAvailabilityResponse, UpdateVendorAvailabilityRequest>({
      query: (body) => ({ url: '/me/vendor-availability', method: 'PUT', body }),
      invalidatesTags: ['VendorAvailability', 'VendorProfile'],
    }),
    getVendorProfile: build.query<Vendor, void>({
      query: () => ({ url: '/me/vendor-profile' }),
      transformResponse: (response: unknown) => unwrapData(response as Vendor | { data: Vendor })!,
      providesTags: ['VendorProfile'],
    }),
    updateVendorProfile: build.mutation<Vendor, UpdateVendorProfileRequest>({
      query: (body) => ({ url: '/me/vendor-profile', method: 'PATCH', body }),
      transformResponse: (response: unknown) => unwrapData(response as Vendor | { data: Vendor })!,
      invalidatesTags: ['VendorProfile', 'Me'],
    }),
    listVendorProfileGallery: build.query<VendorProfileGalleryItem[], void>({
      query: () => ({ url: '/me/vendor-profile/gallery' }),
      transformResponse: (
        raw: VendorProfileGalleryItem[] | { data: VendorProfileGalleryItem[] },
      ) => {
        const data = unwrapData(raw as { data: VendorProfileGalleryItem[] });
        if (Array.isArray(data)) return data;
        if (Array.isArray(raw)) return raw;
        return [];
      },
      providesTags: [{ type: 'VendorProfile', id: 'GALLERY' }],
    }),
    uploadVendorProfileGalleryFile: build.mutation<
      VendorProfileGalleryItem,
      { file: File; caption?: string }
    >({
      query: ({ file, caption }) => {
        const form = new FormData();
        form.append('file', file);
        if (caption?.trim()) form.append('caption', caption.trim());
        return { url: '/me/vendor-profile/gallery', method: 'POST', body: form };
      },
      transformResponse: (raw: VendorProfileGalleryItem | { data: VendorProfileGalleryItem }) =>
        unwrapData(raw) ?? (raw as VendorProfileGalleryItem),
      invalidatesTags: ['VendorProfile', { type: 'VendorProfile', id: 'GALLERY' }],
    }),
    addVendorProfileGalleryItem: build.mutation<
      VendorProfileGalleryItem,
      VendorProfileGalleryUpload
    >({
      query: (body) => ({ url: '/me/vendor-profile/gallery', method: 'POST', body }),
      transformResponse: (raw: VendorProfileGalleryItem | { data: VendorProfileGalleryItem }) =>
        unwrapData(raw) ?? (raw as VendorProfileGalleryItem),
      invalidatesTags: ['VendorProfile', { type: 'VendorProfile', id: 'GALLERY' }],
    }),
    syncVendorProfileGallery: build.mutation<
      { gallery: VendorProfileGalleryItem[] },
      SyncVendorProfileGalleryRequest
    >({
      query: (body) => ({ url: '/me/vendor-profile/gallery', method: 'PUT', body }),
      transformResponse: (
        raw: { gallery: VendorProfileGalleryItem[] } | { data: { gallery: VendorProfileGalleryItem[] } },
      ) => {
        const data = unwrapData(raw as { data: { gallery: VendorProfileGalleryItem[] } });
        if (data?.gallery) return data;
        return raw as { gallery: VendorProfileGalleryItem[] };
      },
      invalidatesTags: ['VendorProfile', { type: 'VendorProfile', id: 'GALLERY' }],
    }),
    deleteVendorProfileGalleryItem: build.mutation<AcknowledgementResponse, { itemId: Id }>({
      query: ({ itemId }) => ({
        url: `/me/vendor-profile/gallery/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorProfile', { type: 'VendorProfile', id: 'GALLERY' }],
    }),
    syncVendorProfileCategories: build.mutation<
      { categories: VendorProfileCategory[] },
      SyncCategoriesRequest
    >({
      query: (body) => ({ url: '/me/vendor-profile/categories', method: 'PUT', body }),
      transformResponse: (
        raw: { categories: VendorProfileCategory[] } | { data: { categories: VendorProfileCategory[] } },
      ) => {
        const data = unwrapData(raw as { data: { categories: VendorProfileCategory[] } });
        if (data?.categories) return data;
        return raw as { categories: VendorProfileCategory[] };
      },
      invalidatesTags: ['VendorProfile'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMeMutation,
  useListSessionsQuery,
  useRevokeSessionMutation,
  useListDevicesQuery,
  useRegisterDeviceMutation,
  useRemoveDeviceMutation,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useGetVendorAvailabilityQuery,
  useSetVendorAvailabilityMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
  useListVendorProfileGalleryQuery,
  useUploadVendorProfileGalleryFileMutation,
  useAddVendorProfileGalleryItemMutation,
  useSyncVendorProfileGalleryMutation,
  useDeleteVendorProfileGalleryItemMutation,
  useSyncVendorProfileCategoriesMutation,
} = meApi;
