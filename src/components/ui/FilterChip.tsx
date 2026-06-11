import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

export function FilterChip({
  active,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 active:scale-[0.98]',
        active
          ? 'bg-ink text-white shadow-card-sm'
          : 'border border-ink-10 bg-white text-ink-60 hover:bg-ink-5 hover:text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
