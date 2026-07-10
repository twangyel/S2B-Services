import { mockSubscriptionPlans } from '@/data';
import { Crown, CheckCircle2, Clock } from 'lucide-react';
import SubscriptionPlanCard from '@/components/cards/SubscriptionPlanCard';
import { cn } from '@/lib/utils';

export default function ProviderSubscription() {
  const currentPlan = 'Pro';

  return (
    <div className="px-4 py-4">
      {/* Current Plan Banner */}
      <div className="mb-4 rounded-xl bg-primary p-4 text-white">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          <h2 className="text-base font-bold">Current Plan: {currentPlan}</h2>
        </div>
        <p className="mt-1 text-sm text-white/80">Your subscription is active until March 15, 2024</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-white/70">
          <Clock className="h-3 w-3" />
          28 days remaining
        </div>
      </div>

      {/* Plans */}
      <h3 className="mb-3 text-base font-bold text-foreground">Choose a Plan</h3>
      <div className="space-y-4">
        {mockSubscriptionPlans.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.name === currentPlan}
          />
        ))}
      </div>

      {/* Payment Info */}
      <div className="mt-6 rounded-xl border border-dashed border-border bg-white p-4 text-center">
        <h4 className="text-sm font-semibold text-foreground">Bank Transfer Details</h4>
        <p className="mt-1 text-xs text-foreground-muted">
          Transfer to Bank of Bhutan, A/C: 123456789
        </p>
        <p className="text-xs text-foreground-muted">
          Upload screenshot for verification
        </p>
        <button className={cn(
          'mt-3 inline-flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium',
          'bg-primary text-white hover:bg-primary-dark'
        )}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Upload Payment Proof
        </button>
      </div>
    </div>
  );
}
