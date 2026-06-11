import { GovernmentIdVerificationPanel } from '@/components/profile/GovernmentIdVerificationPanel';
import { PageHeader, PageShell } from '@/components/layout';
import { useTranslation } from 'react-i18next';

export function GovernmentIdPage() {
  const { t } = useTranslation();

  return (
    <PageShell width="wide" spacing={6} className="max-w-3xl">
      <PageHeader title={t('governmentId.pageTitle')} subtitle={t('governmentId.pageSubtitle')} />
      <GovernmentIdVerificationPanel />
    </PageShell>
  );
}
