import { Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Provider } from '@/types';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import RatingStars from '@/components/common/RatingStars';
import StatusBadge from '@/components/common/StatusBadge';
import PriceChip from '@/components/common/PriceChip';
import { useNavigate } from 'react-router';

interface ProviderCardProps {
  provider: Provider;
  className?: string;
}

export default function ProviderCard({ provider, className }: ProviderCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'rounded-xl bg-white p-4 shadow-card transition-all duration-200',
        provider.isFeatured && 'border-l-4 border-l-secondary',
        className
      )}
    >
      <button
        onClick={() => navigate(`/providers/${provider.id}`)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="relative flex-shrink-0">
          <img
            src={provider.photo}
            alt={provider.name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div className="absolute -bottom-0.5 -right-0.5">
            <StatusBadge status={provider.availabilityStatus} size="sm" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{provider.name}</h3>
            {provider.isVerified && <VerifiedBadge size="sm" />}
          </div>
          <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} />
          <p className="mt-0.5 text-xs text-foreground-muted">
            {provider.location} &middot; {provider.categoryName} &middot; {provider.experienceYears} yrs
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {provider.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-foreground-muted">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <PriceChip price={provider.visitCharge} label="Visit" />
            {provider.hourlyCharge && <PriceChip price={provider.hourlyCharge} label="/hr" />}
          </div>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-foreground-subtle" />
      </button>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <a
          href={`tel:${provider.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-light active:bg-primary/10"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <a
          href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-secondary py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary-light active:bg-secondary/10"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
