import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

const alertBannerVariants = cva(
  'rounded-xl px-4 py-3 text-[13px] font-medium leading-relaxed',
  {
    variants: {
      variant: {
        error: 'border border-coral/30 bg-coral/10 text-coral',
        info: 'border border-ink-10 bg-ink-5/60 text-ink-60',
        warning: 'border border-amber/40 bg-amber/10 text-ink-80',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

export function AlertBanner({
  variant,
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof alertBannerVariants>) {
  return <div className={cn(alertBannerVariants({ variant }), className)}>{children}</div>;
}
