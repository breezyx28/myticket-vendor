import { AvailabilityToggle } from '@/components/vendor/AvailabilityToggle';
import { useGetVendorProfileQuery } from '@/api/endpoints';
import type { VendorAvailability } from '@/types/domain';
import { useTranslation } from 'react-i18next';

export function AvailabilityPage() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useGetVendorProfileQuery();

  const status: VendorAvailability = profile?.availability_status ?? 'available';

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
          <AvailabilityToggle status={status} readOnly />
        )}
        <p className="mt-4 text-[12px] text-ink-40">{t('availability.readOnlyNote')}</p>
      </div>
    </div>
  );
}
