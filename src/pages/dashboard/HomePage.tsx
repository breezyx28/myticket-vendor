import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';
import { AvailabilityToggle } from '@/components/vendor/AvailabilityToggle';
import { StatBubble } from '@/components/vendor/StatBubble';
import { StatusPill } from '@/components/vendor/StatusPill';
import {
  useGetVendorAvailabilityQuery,
  useGetVendorProfileQuery,
  useListEngagementsQuery,
} from '@/api/endpoints';
import { ENV } from '@/config/env';
import { CalendarCheck, MessageSquare, Star, Ticket } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { t } = useTranslation();
  const { data: profile, isLoading: profileLoading } = useGetVendorProfileQuery();
  const { data: availability } = useGetVendorAvailabilityQuery();
  const { data: engagements, isLoading: engagementsLoading } = useListEngagementsQuery({
    page: 1,
    per_page: 50,
  });

  const pendingCount = useMemo(
    () => (engagements?.data ?? []).filter((e) => e.status === 'pending').length,
    [engagements],
  );

  const recent = useMemo(
    () =>
      [...(engagements?.data ?? [])]
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
        .slice(0, 5),
    [engagements],
  );

  if (profileLoading || engagementsLoading) {
    return <SectionSkeleton />;
  }

  return (
    <PageShell>
      <PageHeader
        size="hero"
        title={profile?.business_name ?? t('nav.home')}
        subtitle={t('dashboard.welcome')}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBubble
          label={t('ratings.average')}
          value={profile?.rating_average ?? '—'}
          icon={Star}
          footer={
            <p className="text-[12px] text-ink-40">
              {t('ratings.count', { count: profile?.rating_count ?? 0 })}
            </p>
          }
        />
        <StatBubble
          label={t('dashboard.completedBookings')}
          value={profile?.completed_bookings ?? 0}
          icon={CalendarCheck}
        />
        <StatBubble
          label={t('engagements.status_pending')}
          value={pendingCount}
          icon={MessageSquare}
          footer={
            <Link
              to="/engagements"
              className="text-[12px] font-semibold text-coral transition-colors hover:underline"
            >
              {t('nav.engagements')}
            </Link>
          }
        />
        <StatBubble
          label={t('availability.title')}
          value={
            <AvailabilityToggle
              status={availability?.status ?? profile?.availability_status ?? 'available'}
              readOnly
            />
          }
          footer={
            <Link
              to="/availability"
              className="text-[12px] font-semibold text-coral transition-colors hover:underline"
            >
              {t('nav.availability')}
            </Link>
          }
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/engagements">
          <Button variant="dark">{t('nav.engagements')}</Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline">{t('nav.profile')}</Button>
        </Link>
        <Link to="/preview">
          <Button variant="outline">{t('nav.preview')}</Button>
        </Link>
        <a href={`${ENV.mainWebsiteUrl}/my-tickets`} rel="noreferrer">
          <Button variant="ghost">
            <Ticket size={16} />
            {t('dashboard.myTickets')}
          </Button>
        </a>
      </div>

      <SectionCard title={t('dashboard.recentEngagements')}>
        {recent.length === 0 ? (
          <EmptyState
            title={t('engagements.empty')}
            action={
              <Link to="/engagements">
                <Button variant="outline" size="sm">
                  {t('nav.engagements')}
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-ink-10">
            {recent.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/engagements?focus=${e.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors duration-200 hover:bg-ink-5/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{e.topic}</p>
                    <p className="text-[12px] text-ink-40">
                      {e.organizer_profile_snapshot?.display_name ?? 'Organizer'} ·{' '}
                      <span dir="ltr">{new Date(e.last_message_at).toLocaleString()}</span>
                    </p>
                  </div>
                  <StatusPill
                    status={e.status}
                    label={t(`engagements.status_${e.status}` as 'engagements.status_pending')}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageShell>
  );
}
