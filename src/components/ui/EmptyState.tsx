import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-ink-20 bg-ink-5/40 px-6 py-10 text-center',
        className,
      )}
    >
      <p className="text-[15px] font-semibold text-ink-60">{title}</p>
      {description ? <p className="mt-2 text-[13px] text-ink-40">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
