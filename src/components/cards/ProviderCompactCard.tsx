import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import type { Provider } from '@/types';
import RatingStars from '@/components/common/RatingStars';
import StatusBadge from '@/components/common/StatusBadge';

interface ProviderCompactCardProps {
  provider: Provider;
  className?: string;
}

export default function ProviderCompactCard({ provider, className }: ProviderCompactCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/providers/${provider.id}`)}
      className={cn(
        'flex w-[240px] flex-shrink-0 snap-start flex-col gap-3 rounded-xl bg-white p-3 shadow-card',
        'transition-all duration-200 active:scale-[0.97]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={provider.photo}
            alt={provider.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-sm font-semibold text-foreground">{provider.name}</h3>
          <RatingStars rating={provider.rating} size={12} reviewCount={provider.reviewCount} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <StatusBadge status={provider.availabilityStatus} size="sm" />
        <span className="text-xs font-medium text-foreground">Visit Nu. {provider.visitCharge}</span>
      </div>
    </button>
  );
}
