import { cn } from '@/utils/cn';

/** Surface container. `interactive` adds the hover lift + emerald glow used for clickable cards. */
export default function Card({ as: Component = 'div', interactive = false, padded = true, className, children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-card border border-line bg-surface-raised shadow-card',
        padded && 'p-5 sm:p-6',
        interactive &&
          'transition-all duration-base ease-out hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-content">{title}</h3>
        {description && <p className="mt-1 text-sm text-content-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
