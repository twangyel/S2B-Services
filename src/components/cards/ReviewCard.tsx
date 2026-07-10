import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review } from '@/types';
import RatingStars from '@/components/common/RatingStars';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export default function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <div className={cn('rounded-xl bg-white p-4 shadow-card', className)}>
      <div className="flex items-center justify-between">
        <RatingStars rating={review.rating} size={14} />
        <div className="flex items-center gap-1">
          {review.isVisible ? (
            <Eye className="h-3.5 w-3.5 text-success" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-foreground-subtle" />
          )}
          <span className="text-[10px] text-foreground-muted">
            {review.isVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
          {review.customerName.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">{review.customerName}</p>
          <p className="text-[10px] text-foreground-subtle">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
        &ldquo;{review.comment}&rdquo;
      </p>
    </div>
  );
}
