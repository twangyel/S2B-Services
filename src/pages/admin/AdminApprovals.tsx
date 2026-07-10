import { X, CheckCircle2, Phone } from 'lucide-react';
import { mockProviders } from '@/data';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';

export default function AdminApprovals() {
  const pendingProviders = mockProviders.filter(
    (p) => p.subscriptionStatus === 'pending' || p.subscriptionStatus === 'trial'
  );

  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">Pending Approvals ({pendingProviders.length})</h2>

      <div className="space-y-3">
        {pendingProviders.map((provider) => (
          <div key={provider.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <img src={provider.photo} alt={provider.name} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{provider.name}</h3>
                <p className="text-xs text-foreground-muted">{provider.businessName}</p>
                <p className="text-xs text-foreground-muted">{provider.categoryName} &middot; {provider.location}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-muted">
                  <Phone className="h-3 w-3" />
                  {provider.phone}
                </div>
                <div className="mt-2">
                  <StatusBadge status={provider.subscriptionStatus} size="sm" />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1 bg-success text-white hover:bg-success/90">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-error text-error hover:bg-error-light">
                    <X className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {pendingProviders.length === 0 && (
          <div className="py-8 text-center text-sm text-foreground-muted">No pending approvals</div>
        )}
      </div>
    </div>
  );
}
