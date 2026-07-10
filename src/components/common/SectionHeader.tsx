import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: 'link' | 'button';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function SectionHeader({ title, action, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-2', className)}>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-sm font-medium text-primary"
        >
          {actionLabel || 'See All'}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
