import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  size?: number;
  reviewCount?: number;
}

export default function RatingStars({ rating, size = 14, reviewCount }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= fullStars
                ? 'fill-warning text-warning'
                : i === fullStars + 1 && hasHalf
                  ? 'fill-warning/50 text-warning'
                  : 'fill-none text-foreground-subtle'
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-foreground-muted">({reviewCount})</span>
      )}
    </div>
  );
}
