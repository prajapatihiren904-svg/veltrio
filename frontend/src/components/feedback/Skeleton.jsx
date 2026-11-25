import { cn } from '@/utils/cn';

/** Shimmering placeholder. Size it with className (for example "h-4 w-32"). */
export default function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}
