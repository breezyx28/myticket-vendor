import { PageHeader, PageShell } from '@/components/layout';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';
import { VendorPortfolioSection } from '@/pages/profile/sections/VendorPortfolioSection';
import { useGetVendorProfileQuery } from '@/api/endpoints';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

export function PortfolioPage() {
  const { t } = useTranslation();
  useDocumentTitle('portfolio.title');
  const { data: profile, isLoading } = useGetVendorProfileQuery();

  if (isLoading || !profile) {
    return <SectionSkeleton rows={2} />;
  }

  return (
    <PageShell spacing={6}>
      <PageHeader title={t('portfolio.title')} subtitle={t('portfolio.subtitle')} />
      <VendorPortfolioSection profile={profile} />
    </PageShell>
  );
}
