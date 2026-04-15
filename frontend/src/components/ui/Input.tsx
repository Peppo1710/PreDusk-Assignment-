import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-ink-muted tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-surface-overlay border rounded-xl px-3.5 py-2.5 text-sm text-ink',
          'placeholder:text-ink-faint',
          'shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50',
          'hover:border-[rgba(255,255,255,0.12)]',
          error
            ? 'border-red-500/40 focus:ring-red-500/20 focus:border-red-500/50'
            : 'border-surface-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-faint mt-1">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';
