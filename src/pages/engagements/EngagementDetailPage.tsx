import { EngagementThread } from '@/components/engagements/EngagementThread';
import { AlertBanner, PageShell, SectionCard } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { useListEngagementsQuery } from '@/api/endpoints';
import { useEngagementActions } from '@/hooks/useEngagementActions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ChevronLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export function EngagementDetailPage() {
  const { t } = useTranslation();
  useDocumentTitle('engagements.title');
  const { id } = useParams<{ id: string }>();
  const { data: engagementsPaged, isLoading } = useListEngagementsQuery({ page: 1, per_page: 50 });
  const actions = useEngagementActions();

  const engagement = useMemo(
    () => (engagementsPaged?.data ?? []).find((e) => String(e.id) === id),
    [engagementsPaged, id],
  );

  if (isLoading) {
    return (
      <PageShell spacing={6}>
        <LoadingState />
      </PageShell>
    );
  }

  if (!engagement) {
    return (
      <PageShell width="narrow" spacing={6}>
        <SectionCard>
          <p className="text-center text-[14px] text-ink-60">{t('errors.notFound')}</p>
          <Link to="/engagements" className="mt-4 flex justify-center">
            <Button variant="outline">{t('common.back')}</Button>
          </Link>
        </SectionCard>
      </PageShell>
    );
  }

  return (
    <PageShell spacing={6} className="lg:hidden">
      <Link
        to="/engagements"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-coral hover:underline"
      >
        <ChevronLeft size={16} className="rtl:rotate-180" strokeWidth={2} />
        {t('common.back')}
      </Link>
      {actions.actionError ? <AlertBanner variant="error">{actions.actionError}</AlertBanner> : null}
      <SectionCard>
        <EngagementThread
          engagement={engagement}
          message={actions.message}
          setMessage={actions.setMessage}
          attachmentUrl={actions.attachmentUrl}
          setAttachmentUrl={actions.setAttachmentUrl}
          onAttachFile={(file) => void actions.onAttachFile(file)}
          attaching={actions.attaching}
          declineReason={actions.declineReason}
          setDeclineReason={actions.setDeclineReason}
          onAccept={() => void actions.onAccept(engagement.id)}
          onDecline={() => void actions.onDecline(engagement.id)}
          onSendMessage={() => void actions.onSendMessage(engagement.id)}
          onComplete={() => void actions.onComplete(engagement.id)}
          accepting={actions.accepting}
          declining={actions.declining}
          posting={actions.posting}
          completing={actions.completing}
        />
      </SectionCard>
    </PageShell>
  );
}
