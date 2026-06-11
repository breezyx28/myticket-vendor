import { useTranslation } from 'react-i18next';

export function LoadingState({ className }: { className?: string }) {
  const { t } = useTranslation();
  return <p className={className ?? 'text-[14px] text-ink-60'}>{t('common.loading')}</p>;
}
