import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import FormField from './FormField';
import { controlBorder, controlClasses } from './controlStyles';

/** Native select (best mobile experience) styled like Input. Pass <option> elements as children. */
const Select = forwardRef(function Select(
  { label, hint, error, required, id, className, wrapperClassName, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <FormField label={label} htmlFor={selectId} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses, controlBorder(Boolean(error)), 'appearance-none pr-10', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle"
          aria-hidden="true"
        />
      </div>
    </FormField>
  );
});

export default Select;
