import type { Id, Iso8601, Paginated, PaginationQuery } from '@/api/types/common';

export type NotificationKind =
  | 'role_application_approved'
  | 'role_application_rejected'
  | 'government_id_verified'
  | 'government_id_rejected'
  | 'engagement_message'
  | 'new_engagement'
  | 'general'
  | string;

export interface AppNotification {
  id: Id;
  title: string;
  body: string;
  kind: NotificationKind;
  read_at?: Iso8601 | null;
  href?: string | null;
  created_at: Iso8601;
  [key: string]: unknown;
}

export interface NotificationListQuery extends PaginationQuery {
  since?: Iso8601;
  kind?: NotificationKind;
  unread?: boolean;
}

export type NotificationListResponse = Paginated<AppNotification> & {
  unread_count: number;
};

export interface NotificationStreamGuidance {
  transport: 'polling';
  message: string;
  since: Iso8601;
  poll_interval_seconds?: number;
  [key: string]: unknown;
}
