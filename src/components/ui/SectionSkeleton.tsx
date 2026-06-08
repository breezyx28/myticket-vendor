import { cn } from '@/lib/utils';

export function SectionSkeleton({
  className,
  rows = 4,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn('animate-pulse space-y-4', className)} role="status" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 rounded-xl bg-ink-10" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-ink-10" />
        ))}
      </div>
      <div className="h-48 rounded-3xl bg-ink-10" />
    </div>
  );
}
