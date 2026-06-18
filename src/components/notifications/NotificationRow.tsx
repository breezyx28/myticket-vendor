import { formatDateTime } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export function NotificationRow({
  title,
  body,
  createdAt,
}: {
  title: string;
  body: string;
  createdAt: string;
}) {
  const { i18n } = useTranslation();

  return (
    <>
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-60">{body}</p>
      <p className="mt-2 text-[11px] text-ink-40" dir="ltr">
        {formatDateTime(createdAt, i18n.language)}
      </p>
    </>
  );
}
