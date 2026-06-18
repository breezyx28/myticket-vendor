import { GovernmentIdVerificationPanel } from '@/components/profile/GovernmentIdVerificationPanel';
import { PageHeader, PageShell } from '@/components/layout';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

export function GovernmentIdPage() {
  const { t } = useTranslation();
  useDocumentTitle('governmentId.pageTitle');

  return (
    <PageShell width="wide" spacing={6} className="max-w-3xl">
      <PageHeader title={t('governmentId.pageTitle')} subtitle={t('governmentId.pageSubtitle')} />
      <GovernmentIdVerificationPanel />
    </PageShell>
  );
}
