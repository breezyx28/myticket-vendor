import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function SectionHeading({
  title,
  description,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-40">{title}</p>
      {description ? (
        <p className="mt-1 text-[13px] leading-relaxed text-ink-60">{description}</p>
      ) : null}
    </div>
  );
}
