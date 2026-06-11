import {
  EngagementFilters,
  type EngagementStatusFilter,
} from '@/components/engagements/EngagementFilters';
import { EngagementList } from '@/components/engagements/EngagementList';
import { EngagementThread } from '@/components/engagements/EngagementThread';
import { AlertBanner, PageHeader, PageShell, SectionCard } from '@/components/layout';
import { EmptyState } from '@/components/ui/EmptyState';
import { useListEngagementsQuery } from '@/api/endpoints';
import { useEngagementActions } from '@/hooks/useEngagementActions';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function EngagementsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const [statusFilter, setStatusFilter] = useState<EngagementStatusFilter>('all');

  const { data: engagementsPaged, isLoading, isError } = useListEngagementsQuery({
    page: 1,
    per_page: 50,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const list = useMemo(() => engagementsPaged?.data ?? [], [engagementsPaged?.data]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const effectiveSelectedId = focusId ?? selectedId;

  const actions = useEngagementActions();

  const selected = useMemo(
    () => list.find((e) => String(e.id) === String(effectiveSelectedId)) ?? null,
    [list, effectiveSelectedId],
  );

  return (
    <PageShell spacing={6}>
      <div className="space-y-4">
        <PageHeader title={t('engagements.title')} />
        <EngagementFilters value={statusFilter} onChange={setStatusFilter} />
      </div>

      {actions.actionError ? (
        <AlertBanner variant="error">{actions.actionError}</AlertBanner>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <SectionCard title={t('engagements.title')} className="p-4 md:p-5">
          <EngagementList
            items={list}
            selectedId={effectiveSelectedId}
            isLoading={isLoading}
            isError={isError}
            onSelect={(e) => {
              setSelectedId(e.id);
              setSearchParams({ focus: String(e.id) }, { replace: true });
              if (window.innerWidth < 1024) navigate(`/engagements/${e.id}`);
            }}
          />
        </SectionCard>

        <SectionCard className="hidden p-5 md:p-6 lg:block">
          {selected ? (
            <EngagementThread
              engagement={selected}
              message={actions.message}
              setMessage={actions.setMessage}
              attachmentUrl={actions.attachmentUrl}
              setAttachmentUrl={actions.setAttachmentUrl}
              onAttachFile={(file) => void actions.onAttachFile(file)}
              attaching={actions.attaching}
              declineReason={actions.declineReason}
              setDeclineReason={actions.setDeclineReason}
              onAccept={() => void actions.onAccept(selected.id)}
              onDecline={() => void actions.onDecline(selected.id)}
              onSendMessage={() => void actions.onSendMessage(selected.id)}
              onComplete={() => void actions.onComplete(selected.id)}
              accepting={actions.accepting}
              declining={actions.declining}
              posting={actions.posting}
              completing={actions.completing}
            />
          ) : (
            <EmptyState title={t('engagements.empty')} className="px-4 py-12" />
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}
