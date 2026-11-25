import { cn } from '@/utils/cn';
import { APP_NAME } from '@/constants/app';

export default function Logo({ showText = true, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-control border border-brand-500/30 bg-surface-raised text-brand-500">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <path
            d="M8 9l8 15 8-15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText && (
        <span className="font-display text-lg font-semibold tracking-[0.18em] text-content">{APP_NAME}</span>
      )}
    </span>
  );
}
