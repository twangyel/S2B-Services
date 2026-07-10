import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ size = 'sm' }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-primary-light px-1.5 py-0.5 font-medium text-primary',
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}
    >
      <CheckCircle2 className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {size === 'md' && 'Verified'}
    </span>
  );
}
