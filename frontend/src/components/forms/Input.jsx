import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';
import FormField from './FormField';
import { controlBorder, controlClasses } from './controlStyles';

/** Text input with label, hint, error and optional leading icon (pass a lucide icon component). */
const Input = forwardRef(function Input(
  { label, hint, error, icon: Icon, required, id, className, wrapperClassName, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FormField label={label} htmlFor={inputId} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses, controlBorder(Boolean(error)), Icon && 'pl-10', className)}
          {...props}
        />
      </div>
    </FormField>
  );
});

export default Input;
