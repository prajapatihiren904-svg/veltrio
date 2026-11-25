import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary: 'bg-brand-500 text-brand-ink font-semibold shadow-glow hover:bg-brand-400',
  secondary: 'border border-line bg-surface-overlay text-content hover:border-line-strong hover:bg-surface-raised',
  ghost: 'text-content-muted hover:bg-surface-overlay hover:text-content',
  danger: 'border border-danger/25 bg-danger/10 text-danger hover:bg-danger/20',
};

const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2 px-7 text-base',
  icon: 'h-10 w-10 p-0',
};

/** Class string for button styling, reusable for links: <Link className={buttonClasses({ variant: 'secondary' })} />. */
export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap rounded-control font-medium',
    'transition-all duration-fast ease-out active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  );
}

/**
 * Button. Pass `as={Link}` (with `to`) to render a router link with button styling.
 * `loading` shows a spinner and disables the button.
 */
const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', loading = false, disabled = false, className, children, ...props },
  ref
) {
  const isNativeButton = Component === 'button';
  return (
    <Component
      ref={ref}
      className={buttonClasses({ variant, size, className })}
      {...(isNativeButton && { type: props.type || 'button', disabled: disabled || loading })}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  );
});

export default Button;
