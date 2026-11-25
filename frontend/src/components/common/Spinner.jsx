import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

export default function Spinner({ size = 'md', label = 'Loading', className }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn('animate-spin text-brand-400', sizes[size], className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
