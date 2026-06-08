import { baseApi } from '@/api/baseApi';
import { unwrapData } from '@/api/types/common';
import type { ResourceEnvelope } from '@/api/types/common';
import type { Vendor } from '@/api/types/vendor';
import type { UpdateVendorProfileRequest } from '@/api/types/vendor';
import type {
  UpdateUserPreferencesRequest,
  UpdateVendorAvailabilityRequest,
  UserMe,
  UserPreferences,
  UserPreferencesResponse,
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
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useGetVendorAvailabilityQuery,
  useSetVendorAvailabilityMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
} = meApi;
