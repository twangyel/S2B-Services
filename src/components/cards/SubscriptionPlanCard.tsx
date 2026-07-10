import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/types';
import { Button } from '@/components/ui/button';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isCurrent?: boolean;
  onSelect?: () => void;
  className?: string;
}

export default function SubscriptionPlanCard({ plan, isCurrent, onSelect, className }: SubscriptionPlanCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl bg-white p-5 shadow-card',
        plan.isPopular && 'ring-2 ring-primary',
        className
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          Most Popular
        </div>
      )}

      <div className="text-center">
        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="text-2xl font-extrabold text-foreground">Nu. {plan.price}</span>
          <span className="text-sm text-foreground-muted">/{plan.period}</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-foreground-muted">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={isCurrent}
        className={cn(
          'mt-5 w-full',
          isCurrent
            ? 'bg-muted text-foreground-muted hover:bg-muted'
            : plan.isPopular
              ? 'bg-primary text-white shadow-button hover:bg-primary-dark'
              : 'bg-primary-light text-primary hover:bg-primary/10'
        )}
      >
        {isCurrent ? 'Current Plan' : 'Choose Plan'}
      </Button>
    </div>
  );
}
