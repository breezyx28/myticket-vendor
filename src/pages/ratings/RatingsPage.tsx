import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StarsRow } from '@/components/vendor/StarsRow';
import { useGetVendorProfileQuery, useListVendorRatingsQuery } from '@/api/endpoints';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, formatNumber } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export function RatingsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle('ratings.title');
  const { data: profile } = useGetVendorProfileQuery();
  const { data: ratingsPaged, isLoading } = useListVendorRatingsQuery(
    { slug: profile?.slug ?? '', page: 1, per_page: 20 },
    { skip: !profile?.slug },
  );

  const ratings = ratingsPaged?.data ?? [];

  return (
    <PageShell>
      <PageHeader title={t('ratings.title')} />

      {profile ? (
        <SectionCard variant="inset">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-40">
                {t('ratings.average')}
              </p>
              <p className="font-mono text-3xl font-bold tabular-nums text-ink" dir="ltr">
                {formatNumber(Number(profile.rating_average) || 0, i18n.language, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </p>
            </div>
            <StarsRow value={Math.round(Number(profile.rating_average) || 0)} />
            <p className="text-[13px] text-ink-60">{t('ratings.count', { count: profile.rating_count })}</p>
          </div>
        </SectionCard>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : ratings.length === 0 ? (
        <EmptyState title={t('ratings.empty')} />
      ) : (
        <ul className="space-y-3">
          {ratings.map((rating) => (
            <SectionCard key={rating.id} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <StarsRow value={rating.stars} />
                {rating.created_at ? (
                  <span className="text-[12px] text-ink-40" dir="ltr">
                    {formatDate(rating.created_at, i18n.language)}
                  </span>
                ) : null}
              </div>
              {rating.comment ? (
                <p className="mt-3 text-[14px] leading-relaxed text-ink-60">{rating.comment}</p>
              ) : null}
            </SectionCard>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
