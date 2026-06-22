import { SectionHeading } from '@/components/layout/SectionHeading';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

const sectionCardVariants = cva('rounded-3xl', {
  variants: {
    variant: {
      elevated: 'border border-ink-10 bg-white p-6 shadow-card-sm',
      inset: 'border border-ink-10 bg-ink-5/40 p-4',
      plain: 'border border-ink-10 bg-white p-0 shadow-card-sm overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
});

export function SectionCard({
  id,
  title,
  hint,
  variant,
  children,
  footer,
  className,
  contentClassName,
}: {
  id?: string;
  title?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
} & VariantProps<typeof sectionCardVariants>) {
  const isPlain = variant === 'plain';

  return (
    <section id={id} className={cn(sectionCardVariants({ variant }), className)}>
      {title && !isPlain ? (
        <div className="mb-4">
          <SectionHeading title={title} description={hint} />
        </div>
      ) : null}
      <div className={cn(isPlain ? undefined : contentClassName)}>{children}</div>
      {footer ? (
        <div className={cn('mt-4 border-t border-ink-10 pt-4', isPlain && 'px-6 pb-6')}>
          {footer}
        </div>
      ) : null}
    </section>
  );
}
