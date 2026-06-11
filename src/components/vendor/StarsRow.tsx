import { Star } from 'lucide-react';

export function StarsRow({ value }: { value: number }) {
  const clamped = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <div className="flex gap-0.5" dir="ltr" aria-label={`${clamped} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={i < clamped ? 'fill-lemon text-lemon' : 'text-ink-20'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
