import { FilterChip } from '@/components/ui/FilterChip';
import type { EngagementStatus } from '@/types/domain';
import { useTranslation } from 'react-i18next';

const FILTERS = ['all', 'pending', 'accepted', 'closed'] as const;
export type EngagementStatusFilter = (typeof FILTERS)[number];

export function EngagementFilters({
  value,
  onChange,
}: {
  value: EngagementStatusFilter;
  onChange: (status: EngagementStatusFilter) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((status) => (
        <FilterChip key={status} active={value === status} onClick={() => onChange(status)}>
          {status === 'all'
            ? t('engagements.filterAll')
            : t(`engagements.status_${status}` as `engagements.status_${EngagementStatus}`)}
        </FilterChip>
      ))}
    </div>
  );
}
