import { cn } from '@/lib/utils';

interface PriceChipProps {
  price: number;
  label?: string;
  size?: 'sm' | 'md';
}

export default function PriceChip({ price, label, size = 'sm' }: PriceChipProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
      {label && <span className="text-foreground-muted">{label}</span>}
      <span>Nu. {price.toLocaleString()}</span>
    </span>
  );
}
