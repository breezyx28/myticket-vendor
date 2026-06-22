import { Button } from '@/components/ui/Button';
import type { ReactNode } from 'react';

export function SettingsFormFooter({
  label,
  loading,
}: {
  label: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-ink-10 pt-5 sm:flex-row sm:justify-end">
      <Button
        type="submit"
        variant="dark"
        loading={loading}
        className="w-full transition-transform active:scale-[0.96] sm:w-auto"
      >
        {label}
      </Button>
    </div>
  );
}

export function SettingsSubsection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        {description ? <p className="mt-0.5 text-pretty text-[13px] text-ink-60">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
