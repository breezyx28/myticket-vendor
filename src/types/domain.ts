/** Domain types for the Vendor Dashboard. */

export type UserRole = 'guest' | 'talent' | 'vendor' | 'organizer';

export type RoleApplicationStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected';

export type VendorAvailability = 'available' | 'reserved';

export type EngagementStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'closed';

export interface VendorProfileCategory {
  id: number;
  vendor_profile_id: number;
  service_category_id: number;
}

export interface VendorProfileGalleryItem {
  id: number;
  vendor_profile_id: number;
  image_url: string;
  caption: string | null;
  position: number;
}

export interface VendorProfile {
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

export interface VendorApplicationDocument {
  id: number;
  kind: 'url' | 'document';
  value: string;
  label: string | null;
  position: number;
}

export interface VendorApplicationGalleryItem {
  id: number;
  image_url: string;
  caption: string | null;
  position: number;
}

export interface VendorApplicationDetail {
  id: number;
  status: RoleApplicationStatus;
  submitted_at?: string | null;
  rejection_reason?: string | null;
  vendor_application?: {
    id: number;
    profile_name?: string | null;
    business_name?: string | null;
    bio?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    city?: number | null;
    coverage_area?: string | null;
    documents?: VendorApplicationDocument[];
    gallery?: VendorApplicationGalleryItem[];
  } | null;
}

export const APPLICATION_STATUS_PILL: Record<string, string> = {
  draft: 'bg-ink-5 text-ink-60',
  submitted: 'bg-sky/30 text-ink-DEFAULT',
  approved: 'bg-mint/30 text-mint-dark',
  rejected: 'bg-coral/15 text-coral',
};

export const ENGAGEMENT_STATUS_PILL: Record<string, string> = {
  pending: 'bg-ink-5 text-ink-60',
  accepted: 'bg-mint/30 text-mint-dark',
  declined: 'bg-coral/15 text-coral',
  cancelled: 'bg-ink-5 text-ink-40',
  closed: 'bg-lavender/30 text-ink-DEFAULT',
};
