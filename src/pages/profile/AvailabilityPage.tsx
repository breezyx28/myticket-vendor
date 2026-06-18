import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { AvailabilityToggle } from '@/components/vendor/AvailabilityToggle';
import {
  useGetVendorAvailabilityQuery,
  useSetVendorAvailabilityMutation,
} from '@/api/endpoints';
import { useMutationToast } from '@/hooks/useMutationToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { VendorAvailability } from '@/types/domain';
import { useTranslation } from 'react-i18next';

export function AvailabilityPage() {
  const { t } = useTranslation();
  useDocumentTitle('availability.title');
  const { data: availability, isLoading } = useGetVendorAvailabilityQuery();
  const [setAvailability, { isLoading: saving }] = useSetVendorAvailabilityMutation();
  const { runMutation } = useMutationToast();

  const status: VendorAvailability = availability?.status ?? 'available';

  async function onChange(next: VendorAvailability) {
    await runMutation(() => setAvailability({ status: next }).unwrap());
  }

  return (
    <PageShell width="narrow" spacing={6}>
      <PageHeader
        title={t('availability.title')}
        subtitle={
          status === 'available' ? t('availability.availableHint') : t('availability.reservedHint')
        }
      />

      <SectionCard>
        {isLoading ? (
          <p className="text-[14px] text-ink-60">{t('common.loading')}</p>
        ) : (
          <AvailabilityToggle
            status={status}
            onChange={(next) => void onChange(next)}
            disabled={saving}
          />
        )}
        <p className="mt-4 text-[12px] leading-relaxed text-ink-40">{t('availability.engagementHint')}</p>
      </SectionCard>
    </PageShell>
  );
}
