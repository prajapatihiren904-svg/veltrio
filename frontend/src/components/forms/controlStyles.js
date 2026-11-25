// Shared look for text inputs and selects so every form control stays consistent.
export const controlClasses =
  'h-11 w-full rounded-control border bg-surface px-3.5 text-sm text-content placeholder:text-content-subtle ' +
  'transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-60 ' +
  'focus-visible:border-brand-500 focus-visible:ring-brand-500/40 focus-visible:ring-offset-0';

export const controlBorder = (hasError) => (hasError ? 'border-danger/60' : 'border-line hover:border-line-strong');
