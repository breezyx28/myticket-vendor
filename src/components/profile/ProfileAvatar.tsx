import { cn } from '@/lib/utils';

export function ProfileAvatar({
  src,
  alt = '',
  size = 'md',
  className,
}: {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClass = {
    sm: 'h-20 w-20 rounded-2xl',
    md: 'h-28 w-28 rounded-3xl',
    lg: 'aspect-square w-full rounded-3xl',
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(sizeClass, 'object-cover ring-2 ring-ink-10', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'flex items-center justify-center bg-ink-5 text-ink-40 ring-2 ring-ink-10',
        className,
      )}
      aria-hidden
    >
      —
    </div>
  );
}
