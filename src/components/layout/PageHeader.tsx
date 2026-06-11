import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const titleSizeClass = {
  page: 'text-[28px]',
  hero: 'text-[32px]',
} as const;

export function PageHeader({
  title,
  subtitle,
  actions,
  size = 'page',
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  size?: keyof typeof titleSizeClass;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            'font-extrabold tracking-tight text-ink text-balance',
            titleSizeClass[size],
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[65ch] text-[14px] leading-relaxed text-ink-60">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
