import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, ReactNode } from 'react';

export function CheckboxField({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-ink-20 text-ink focus-visible:ring-2 focus-visible:ring-coral"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-60">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
