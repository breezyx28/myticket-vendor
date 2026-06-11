import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const widthClass = {
  default: 'max-w-[1280px]',
  narrow: 'max-w-2xl',
  wide: 'max-w-[1400px]',
} as const;

const spacingClass = {
  6: 'space-y-6',
  8: 'space-y-8',
} as const;

export function PageShell({
  children,
  width = 'default',
  spacing = 8,
  className,
}: {
  children: ReactNode;
  width?: keyof typeof widthClass;
  spacing?: keyof typeof spacingClass;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full', widthClass[width], spacingClass[spacing], className)}>
      {children}
    </div>
  );
}
