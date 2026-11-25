import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';

const fills = {
  brand: 'bg-brand-500',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/**
 * Progress bar for budgets and goals.
 * tone="auto" turns amber at `warnAt` percent and red at `dangerAt` percent (budget behavior);
 * tone="brand" stays emerald (goal behavior).
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  tone = 'brand',
  warnAt = 80,
  dangerAt = 100,
  label,
  className,
}) {
  const reduceMotion = useReducedMotion();
  const percent = max > 0 ? Math.max(0, (value / max) * 100) : 0;
  const clamped = Math.min(percent, 100);
  const resolvedTone = tone === 'auto' ? (percent >= dangerAt ? 'danger' : percent >= warnAt ? 'warning' : 'brand') : tone;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-overlay', className)}
    >
      <motion.div
        className={cn('h-full rounded-full', fills[resolvedTone])}
        initial={reduceMotion ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
