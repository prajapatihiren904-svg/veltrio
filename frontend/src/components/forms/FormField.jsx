import { cn } from '@/utils/cn';

/** Label + control + hint/error wrapper. `htmlFor` must match the control's id. */
export default function FormField({ label, htmlFor, hint, error, required = false, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-content">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="text-xs text-content-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
