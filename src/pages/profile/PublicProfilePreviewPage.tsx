import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AvailabilityToggle } from '@/components/vendor/AvailabilityToggle';
import { useGetVendorProfileQuery, useGetVendorServiceCategoriesQuery } from '@/api/endpoints';
import { buildVendorCategoryRefMap, vendorCategoryLabel } from '@/lib/vendorCategoryLabel';
import { ENV } from '@/config/env';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatNumber } from '@/lib/format';
import { ExternalLink, Star } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function PublicProfilePreviewPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle('nav.preview');
  const { data: profile, isLoading } = useGetVendorProfileQuery();
  const { data: serviceCategories = [] } = useGetVendorServiceCategoriesQuery();
  const categoryRefMap = useMemo(
    () => buildVendorCategoryRefMap(serviceCategories),
    [serviceCategories],
  );
  const isAr = i18n.language === 'ar';

  if (isLoading || !profile) {
    return <SectionSkeleton rows={2} />;
  }

  const publicUrl = `${ENV.mainWebsiteUrl}/vendors/${profile.slug}`;

  return (
    <PageShell spacing={6}>
      <PageHeader
        title={t('nav.preview')}
        subtitle={t('profile.publicSlug')}
        actions={
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="outline">
              <ExternalLink size={16} />
              {t('nav.preview')}
            </Button>
          </a>
        }
      />

      <SectionCard className="overflow-hidden p-0 shadow-card-md">
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          {profile.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={t('accessibility.profileImageAlt')}
              className="h-full min-h-[240px] w-full object-cover"
            />
          ) : (
            <div className="min-h-[240px] bg-gradient-to-br from-lemon/40 to-coral/20" />
          )}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink">{profile.business_name}</h2>
              <AvailabilityToggle status={profile.availability_status} readOnly />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink" dir="ltr">
              <Star size={16} className="fill-lemon text-lemon" />
              {formatNumber(Number(profile.rating_average) || 0, i18n.language, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{' '}
              · {t('ratings.count', { count: profile.rating_count })}
            </div>
            {profile.coverage_area ? (
              <p className="mt-2 text-[13px] text-ink-60">{profile.coverage_area}</p>
            ) : null}
            {profile.bio ? (
              <p className="mt-4 text-[14px] leading-relaxed text-ink-60">{profile.bio}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.categories?.map((c) => (
                <Badge key={c.id} variant="success">
                  {vendorCategoryLabel(c, isAr, categoryRefMap, t('common.notAvailable'))}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {profile.gallery && profile.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 border-t border-ink-10 p-4 sm:grid-cols-4">
            {profile.gallery.map((item) => (
              <img
                key={item.id}
                src={item.image_url}
                alt={item.caption ?? t('portfolio.galleryPhotoAlt', { index: item.position + 1 })}
                className="aspect-square rounded-2xl object-cover"
              />
            ))}
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}
