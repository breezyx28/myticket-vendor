import { SectionCard } from '@/components/layout';
import { ENV } from '@/config/env';
import type { Vendor } from '@/api/types/vendor';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function ProfilePublicLinkSection({
  profile,
  regionLabel,
}: {
  profile: Vendor;
  regionLabel: string | null;
}) {
  const { t } = useTranslation();

  return (
    <SectionCard variant="inset">
      <p className="text-[13px] font-semibold text-ink">{t('profile.publicSlug')}</p>
      <a
        href={`${ENV.mainWebsiteUrl}/vendors/${profile.slug}`}
        className="mt-1 inline-block font-mono text-[13px] text-coral hover:underline"
        dir="ltr"
        rel="noreferrer"
      >
        /vendors/{profile.slug}
      </a>
      {regionLabel ? <p className="mt-2 text-[13px] text-ink-60">{regionLabel}</p> : null}
      <Link
        to="/government-id"
        className="mt-3 inline-block text-[12px] font-semibold text-ink-60 transition-colors hover:text-coral"
      >
        {t('profile.verificationLink')}
      </Link>
    </SectionCard>
  );
}
