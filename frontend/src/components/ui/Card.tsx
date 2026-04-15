import { cn } from '@/lib/utils';

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface-raised rounded-2xl border border-surface-border',
        'shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 py-4 border-b border-surface-border', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)}>
      {children}
    </div>
  );
}
