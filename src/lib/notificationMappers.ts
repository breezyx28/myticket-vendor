import type { AppNotification } from '@/api/types/notification';
import type { UiNotification } from '@/contexts/notificationContext';
import { normalizeNotificationHref } from '@/lib/notificationHref';

export function apiNotificationToUi(n: AppNotification): UiNotification {
  return {
    id: String(n.id),
    title: n.title,
    body: n.body,
    read: n.read_at != null,
    createdAt: n.created_at,
    kind: n.kind,
    href: normalizeNotificationHref(n.href),
  };
}
