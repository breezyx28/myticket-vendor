import {
  useGetNotificationsStreamQuery,
  useListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/api/endpoints';
import {
  NotificationContext,
  type NotificationContextValue,
  type UiNotification,
} from '@/contexts/notificationContext';
import { useAuth } from '@/hooks/useAuth';
import { apiNotificationToUi } from '@/lib/notificationMappers';
import { useCallback, useMemo, type ReactNode } from 'react';

const DEFAULT_POLL_MS = 30_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const { data: streamGuidance } = useGetNotificationsStreamQuery(undefined, {
    skip: !isAuthenticated,
  });

  const pollingInterval = useMemo(() => {
    const seconds = streamGuidance?.poll_interval_seconds;
    if (typeof seconds === 'number' && seconds > 0) {
      return Math.max(seconds * 1000, 5_000);
    }
    return DEFAULT_POLL_MS;
  }, [streamGuidance]);

  const { data: paged, isLoading } = useListNotificationsQuery(
    { per_page: 30 },
    { skip: !isAuthenticated, pollingInterval },
  );

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation();

  const items = useMemo<UiNotification[]>(
    () => (paged?.data ?? []).map(apiNotificationToUi),
    [paged?.data],
  );

  const unreadCount = paged?.unread_count ?? items.filter((n) => !n.read).length;

  const markRead = useCallback(
    (id: string) => {
      void markNotificationRead({ id });
    },
    [markNotificationRead],
  );

  const markAllRead = useCallback(() => {
    void markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  const value = useMemo<NotificationContextValue>(
    () => ({ items, unreadCount, markRead, markAllRead, isLoading }),
    [items, unreadCount, markRead, markAllRead, isLoading],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
