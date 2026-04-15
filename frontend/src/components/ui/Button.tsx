import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
        size === 'sm' && 'px-3 py-1.5 text-xs h-7',
        size === 'md' && 'px-4 py-2 text-sm h-9',
        size === 'lg' && 'px-5 py-2.5 text-sm h-10',
        variant === 'primary' && [
          'bg-gradient-to-b from-brand-light to-brand text-white font-semibold',
          'shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_4px_12px_rgba(139,92,246,0.3)]',
          'hover:from-brand hover:to-brand-dim hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_6px_16px_rgba(139,92,246,0.4)]',
          'active:from-brand-dim active:to-brand-dim active:scale-[0.98]',
        ],
        variant === 'secondary' && [
          'bg-surface-overlay border border-surface-border text-ink-muted',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          'hover:text-ink hover:bg-surface-hover hover:border-[rgba(255,255,255,0.12)]',
          'active:scale-[0.98]',
        ],
        variant === 'ghost' && [
          'text-ink-muted hover:text-ink hover:bg-surface-hover',
          'active:scale-[0.98]',
        ],
        variant === 'danger' && [
          'bg-red-500/10 border border-red-500/20 text-red-400',
          'hover:bg-red-500/20 hover:border-red-500/30',
          'active:scale-[0.98]',
        ],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin opacity-80" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
