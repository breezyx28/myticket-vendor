import { AvailabilityToggle } from '@/components/vendor/AvailabilityToggle';
import {
  useGetVendorAvailabilityQuery,
  useSetVendorAvailabilityMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import type { VendorAvailability } from '@/types/domain';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function AvailabilityPage() {
  const { t } = useTranslation();
  const { data: availability, isLoading } = useGetVendorAvailabilityQuery();
  const [setAvailability, { isLoading: saving }] = useSetVendorAvailabilityMutation();

  const status: VendorAvailability = availability?.status ?? 'available';

  async function onChange(next: VendorAvailability) {
    try {
      await setAvailability({ status: next }).unwrap();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{t('availability.title')}</h1>
        <p className="mt-2 text-[14px] text-ink-60">
          {status === 'available' ? t('availability.availableHint') : t('availability.reservedHint')}
        </p>
      </div>

      <div className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        {isLoading ? (
          <p className="text-[14px] text-ink-60">{t('common.loading')}</p>
        ) : (
          <AvailabilityToggle
            status={status}
            onChange={(next) => void onChange(next)}
            disabled={saving}
          />
        )}
        <p className="mt-4 text-[12px] text-ink-40">{t('availability.engagementHint')}</p>
      </div>
    </div>
  );
}
