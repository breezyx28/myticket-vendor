import { NotificationRow } from '@/components/notifications/NotificationRow';
import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useNotifications } from '@/hooks/useNotifications';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function NotificationsPage() {
  const { t } = useTranslation();
  useDocumentTitle('notifications.title');
  const { items, unreadCount, markRead, markAllRead, isLoading } = useNotifications();

  return (
    <PageShell width="narrow" spacing={6}>
      <PageHeader
        title={t('notifications.title')}
        subtitle={unreadCount > 0 ? t('notifications.unreadCount', { count: unreadCount }) : undefined}
        actions={
          unreadCount > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => markAllRead()}>
              {t('notifications.markAllRead')}
            </Button>
          ) : undefined
        }
      />

      {isLoading && items.length === 0 ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title={t('notifications.empty')} />
      ) : (
        <SectionCard variant="plain" className="overflow-hidden">
          <ul className="divide-y divide-ink-10">
            {items.map((n) => (
              <li key={n.id} className={cn('px-5 py-4', !n.read && 'bg-lemon/5')}>
                {n.href ? (
                  <Link to={n.href} className="block" onClick={() => markRead(n.id)}>
                    <NotificationRow title={n.title} body={n.body} createdAt={n.createdAt} />
                  </Link>
                ) : (
                  <button type="button" className="w-full text-start" onClick={() => markRead(n.id)}>
                    <NotificationRow title={n.title} body={n.body} createdAt={n.createdAt} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </PageShell>
  );
}
