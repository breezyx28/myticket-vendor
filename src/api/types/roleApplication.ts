import type { Id, Iso8601 } from '@/api/types/common';
import type { RoleApplicationStatus } from '@/types/domain';

export type RoleApplicationKind = 'vendor';

export interface RoleApplicationSummary {
  id: Id;
  kind?: RoleApplicationKind;
  application_type?: RoleApplicationKind;
  status: RoleApplicationStatus;
  submitted_at?: Iso8601 | null;
  rejection_reason?: string | null;
  [key: string]: unknown;
}

export interface MyRoleApplications {
  vendor?: RoleApplicationSummary | null;
  [key: string]: unknown;
}

export interface CreateVendorApplicationRequest {
  profile_name: string;
  contact_email: string;
  contact_phone?: string;
  [key: string]: unknown;
}

export interface UpdateVendorApplicationRequest {
  business_name?: string;
  bio?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: number;
  coverage_area?: string;
  internal_note?: string;
  [key: string]: unknown;
}

export interface VendorApplicationDocument {
  id: Id;
  kind: 'url' | 'document';
  value: string;
  label: string | null;
  position: number;
  created_at?: Iso8601;
  [key: string]: unknown;
}

export interface VendorApplicationDocumentUpload {
  kind: 'url' | 'document';
  value: string;
  label?: string;
  position?: number;
}

export interface VendorApplicationGalleryItem {
  id: Id;
  image_url: string;
  caption: string | null;
  position: number;
  created_at?: Iso8601;
  [key: string]: unknown;
}

export interface VendorApplicationGalleryUpload {
  image_url: string;
  caption?: string;
  position?: number;
}

export interface VendorApplicationCategory {
  id: Id;
  vendor_application_id?: Id;
  service_category_id: number;
  slug?: string;
  name_en?: string;
  name_ar?: string;
  [key: string]: unknown;
}

export interface AddVendorCategoryRequest {
  slug?: string;
  service_category_id?: number;
}

export interface RoleApplicationVendorDetail {
  id: Id;
  profile_name?: string | null;
  business_name?: string | null;
  bio?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  city?: Id | null;
  coverage_area?: string | null;
  documents?: VendorApplicationDocument[];
  gallery?: VendorApplicationGalleryItem[];
  categories?: VendorApplicationCategory[];
  [key: string]: unknown;
}

export interface RoleApplicationDetail {
  id: Id;
  kind?: RoleApplicationKind;
  application_type?: RoleApplicationKind;
  status: RoleApplicationStatus;
  submitted_at?: Iso8601 | null;
  rejection_reason?: string | null;
  internal_note?: string | null;
  vendor_application?: RoleApplicationVendorDetail | null;
  [key: string]: unknown;
}

export interface RoleApplicationDetailEnvelope {
  data: RoleApplicationDetail;
}

export interface RoleApplicationSummaryEnvelope {
  data: RoleApplicationSummary;
}
