import type { Id, Iso8601 } from '@/api/types/common';
import type { VendorAvailability } from '@/types/domain';

export interface UserMe {
  id: Id;
  email: string;
  phone?: string | null;
  full_name: string;
  display_name?: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
  avatar_url?: string | null;
  email_verified_at?: Iso8601 | null;
  phone_verified_at?: Iso8601 | null;
  two_factor_enabled?: boolean;
  role?: string | null;
  roles?: string[];
  created_at?: Iso8601;
  updated_at?: Iso8601;
  [key: string]: unknown;
}

export type LanguagePreference = 'en' | 'ar';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserPreferences {
  language: LanguagePreference;
  theme: ThemePreference;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  [key: string]: unknown;
}

export interface UserPreferencesResponse {
  data: UserPreferences;
}

export interface UpdateUserPreferencesRequest {
  language?: LanguagePreference;
  theme?: ThemePreference;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
}

export interface VendorAvailabilityResponse {
  status: VendorAvailability;
  [key: string]: unknown;
}

export interface UpdateVendorAvailabilityRequest {
  status: VendorAvailability;
}

