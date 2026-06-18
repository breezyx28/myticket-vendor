import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusPill } from '@/components/vendor/StatusPill';
import type { Engagement } from '@/api/types/engagement';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export function EngagementList({
  items,
  selectedId,
  isLoading,
  isError,
  onSelect,
}: {
  items: Engagement[];
  selectedId: string | number | null;
  isLoading?: boolean;
  isError?: boolean;
  onSelect: (engagement: Engagement) => void;
}) {
  const { t, i18n } = useTranslation();

  if (isLoading) return <LoadingState className="text-[13px] text-ink-40" />;
  if (isError) return <p className="text-[13px] font-medium text-coral">{t('common.error')}</p>;
  if (items.length === 0) return <EmptyState title={t('engagements.empty')} className="px-4 py-8" />;

  return (
    <ul className="space-y-2">
      {items.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onSelect(e)}
            className={cn(
              'w-full rounded-xl border p-3 text-start transition-colors duration-200',
              String(selectedId) === String(e.id)
                ? 'border-coral bg-coral/5'
                : 'border-ink-10 hover:border-ink-20 hover:bg-ink-5/30',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-ink">
                {e.organizer_profile_snapshot?.display_name ?? t('engagements.organizerFallback')}
              </p>
              <StatusPill
                status={e.status}
                label={t(`engagements.status_${e.status}` as 'engagements.status_pending')}
              />
            </div>
            <p className="mt-1 line-clamp-2 text-[12px] text-ink-60">{e.preview || e.topic}</p>
            <p className="mt-2 text-[11px] text-ink-40" dir="ltr">
              {formatDateTime(e.last_message_at, i18n.language)}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
