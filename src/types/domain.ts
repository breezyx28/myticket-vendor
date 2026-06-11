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

export type {
  Vendor as VendorProfile,
  VendorProfileCategory,
  VendorProfileGalleryItem,
} from '@/api/types/vendor';

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
    categories?: Array<{
      id: number;
      service_category_id: number;
      slug?: string;
      name_en?: string;
      name_ar?: string;
    }>;
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
