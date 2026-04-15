import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  className,
  animated,
}: {
  value: number;
  className?: string;
  animated?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const done = pct >= 100;

  return (
    <div
      className={cn(
        'w-full h-1.5 bg-surface-border rounded-full overflow-hidden',
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          done
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
            : 'bg-gradient-to-r from-brand-dim to-brand-light',
          animated && !done && 'relative overflow-hidden'
        )}
        style={{ width: `${pct}%` }}
      >
        {animated && pct > 0 && !done && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent progress-indeterminate" />
        )}
      </div>
    </div>
  );
}
