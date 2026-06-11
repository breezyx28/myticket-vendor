import type { Id, Iso8601 } from '@/api/types/common';
import type { VendorAvailability } from '@/types/domain';

export interface VendorProfileCategory {
  id: number;
  vendor_profile_id: number;
  service_category_id: number;
  slug?: string;
  name_en?: string;
  name_ar?: string;
  is_custom?: boolean;
  is_active?: boolean;
  display_order?: number;
  created_by_user_id?: number | null;
}

export interface VendorProfileGalleryItem {
  id: number;
  vendor_profile_id: number;
  image_url: string;
  caption: string | null;
  position: number;
  created_at?: Iso8601;
}

export interface VendorProfileGallerySyncItem {
  image_url: string;
  caption?: string | null;
  position?: number;
}

export interface SyncVendorProfileGalleryRequest {
  gallery: VendorProfileGallerySyncItem[];
}

export interface Vendor {
  id: number;
  user_id: number;
  slug: string;
  business_name: string;
  bio: string | null;
  region_id: number | null;
  city_id: number | null;
  coverage_area: string | null;
  profile_image_url: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  availability_status: VendorAvailability;
  rating_average: string;
  rating_count: number;
  completed_bookings: number;
  is_active: boolean;
  categories?: VendorProfileCategory[];
  gallery?: VendorProfileGalleryItem[];
}

export interface VendorRating {
  id: Id;
  user_id: number;
  target_type: 'vendor';
  target_id: number;
  engagement_id: number | null;
  stars: number;
  comment: string | null;
  is_visible: boolean;
  created_at: Iso8601;
  updated_at: Iso8601;
}

export interface VendorProfileGalleryUpload {
  image_url: string;
  caption?: string;
  position?: number;
}

export interface UpdateVendorProfileRequest {
  business_name?: string;
  bio?: string | null;
  website_url?: string | null;
  instagram_handle?: string | null;
  coverage_area?: string | null;
  /** Preferred write alias — maps to `profile_image_url` in DB (assumed; see vendor-frontend-backend-gaps.md). */
  profile_image?: string | null;
}

